// Avatar emojis for the poll answers. Each candidate gets an application emoji made from their
// avatar, so the answer shows the face next to the nick.
//
// Image, in this order:
//   1. The site avatar, resized by Cloudflare image transformations: AVATAR_EMOJI_BASE_URL +
//      "/<current player name>.png". A 404 or a non-image goes to the next source.
//   2. The avatar of the Discord account linked in `discord_accounts`.
//   3. No emoji.
//
// The emoji name is `av_<playerId>_<first 8 hex of SHA-256 of the image>`. A changed avatar gives a
// new name, so the bot creates a new emoji and deletes the older versions of that player.
//
// This is decoration. Every failure (fetch, create, a 429 after one short retry, a timeout, the
// time budget) only removes the emoji of that answer. The poll is always sent.

import type { BotEnv } from '../env';
import type { Candidate } from './candidates';
import { MAX_INLINE_RETRY_MS } from './discordApi';

const API = 'https://discord.com/api/v10';

/** Discord's limit for an emoji image. */
export const MAX_EMOJI_BYTES = 256 * 1024;
/** Per request: an image fetch or one Discord call. */
export const EMOJI_REQUEST_TIMEOUT_MS = 5_000;
/**
 * For all candidates together. `/ankieta` runs in `waitUntil`, which ends about 30 s after the
 * deferred reply, and the poll and the signup message must still go out after this.
 */
export const EMOJI_BUDGET_MS = 12_000;

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

/** playerId → application emoji ID. A candidate without an entry gets no emoji. */
export type AvatarEmojis = Map<number, string>;

export type AvatarEmojiResolver = (candidates: Candidate[]) => Promise<AvatarEmojis>;

export interface AvatarEmojiDeps {
    fetcher?: typeof fetch;
    sleep?: (ms: number) => Promise<void>;
    /** Epoch ms. For the budget. */
    clock?: () => number;
    timeoutMs?: number;
    budgetMs?: number;
}

interface AppEmoji {
    id: string;
    name: string;
}

interface Identity {
    playerId: number;
    name: string;
    discordUserId: string | null;
    avatar: string | null;
}

class EmojiError extends Error {}

export function emojiName(playerId: number, hash: string): string {
    return `av_${playerId}_${hash.slice(0, 8)}`;
}

export function siteAvatarUrl(baseUrl: string, playerName: string): string {
    return `${baseUrl.replace(/\/+$/, '')}/${encodeURIComponent(playerName)}.png`;
}

export function discordAvatarUrl(discordUserId: string, avatar: string): string {
    return `https://cdn.discordapp.com/avatars/${discordUserId}/${avatar}.png?size=128`;
}

async function sha256Hex(bytes: ArrayBuffer): Promise<string> {
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    return [...digest].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function toBase64(bytes: ArrayBuffer): string {
    const view = new Uint8Array(bytes);
    let binary = '';
    for (let i = 0; i < view.length; i += 0x8000) binary += String.fromCharCode(...view.subarray(i, i + 0x8000));
    return btoa(binary);
}

const realSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * The resolver for `/ankieta`. With an empty AVATAR_EMOJI_BASE_URL the feature is off: no
 * requests, no emojis.
 */
export function createAvatarEmojis(
    env: Pick<BotEnv, 'AVATAR_EMOJI_BASE_URL' | 'DISCORD_APPLICATION_ID' | 'DISCORD_BOT_TOKEN'>,
    db: D1Database,
    deps: AvatarEmojiDeps = {},
): AvatarEmojiResolver {
    const baseUrl = (env.AVATAR_EMOJI_BASE_URL ?? '').trim();
    if (baseUrl === '') return async () => new Map();

    const fetcher = deps.fetcher ?? fetch;
    const sleep = deps.sleep ?? realSleep;
    const clock = deps.clock ?? Date.now;
    const timeoutMs = deps.timeoutMs ?? EMOJI_REQUEST_TIMEOUT_MS;
    const budgetMs = deps.budgetMs ?? EMOJI_BUDGET_MS;
    const appPath = `${API}/applications/${env.DISCORD_APPLICATION_ID}/emojis`;
    const auth = { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` };

    /** One request with a timeout. The race also covers a fetcher that ignores the signal. */
    async function timedFetch(url: string, init: RequestInit = {}): Promise<Response> {
        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout> | undefined;
        const timeout = new Promise<never>((_, reject) => {
            timer = setTimeout(() => {
                controller.abort();
                reject(new EmojiError(`timeout after ${timeoutMs} ms: ${url}`));
            }, timeoutMs);
        });
        try {
            return await Promise.race([fetcher(url, { ...init, signal: controller.signal }), timeout]);
        } finally {
            clearTimeout(timer);
        }
    }

    /** A Discord call. A 429 with a short wait gets one retry. */
    async function discordCall(method: string, url: string, body?: unknown): Promise<Response> {
        const init: RequestInit = {
            method,
            headers: body === undefined ? auth : { ...auth, 'Content-Type': 'application/json' },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        };
        for (let attempt = 0; ; attempt++) {
            const response = await timedFetch(url, init);
            if (response.ok) return response;
            const text = await response.text();
            if (response.status === 429 && attempt === 0) {
                let seconds = Number.NaN;
                try {
                    seconds = Number((JSON.parse(text) as { retry_after?: unknown }).retry_after);
                } catch {
                    seconds = Number(response.headers.get('Retry-After'));
                }
                const wait = Math.ceil(seconds * 1000);
                if (Number.isFinite(wait) && wait >= 0 && wait <= MAX_INLINE_RETRY_MS) {
                    await sleep(wait);
                    continue;
                }
            }
            throw new EmojiError(`Discord ${method} ${response.status}: ${text.slice(0, 200)}`);
        }
    }

    /** The image bytes and type, or null for a 404, a non-image or an image over the limit. */
    async function fetchImage(url: string): Promise<{ bytes: ArrayBuffer; type: string } | null> {
        try {
            const response = await timedFetch(url);
            if (!response.ok) return null;
            const type = (response.headers.get('Content-Type') ?? '').split(';')[0].trim().toLowerCase();
            if (!IMAGE_TYPES.includes(type)) return null;
            const length = Number(response.headers.get('Content-Length'));
            if (Number.isFinite(length) && length > MAX_EMOJI_BYTES) return null;
            const bytes = await response.arrayBuffer();
            if (bytes.byteLength === 0 || bytes.byteLength > MAX_EMOJI_BYTES) return null;
            return { bytes, type };
        } catch (error) {
            console.warn(JSON.stringify({ event: 'avatarFetchFailed', url, error: String(error) }));
            return null;
        }
    }

    async function loadIdentities(candidates: Candidate[]): Promise<Map<number, Identity>> {
        const ids = candidates.map((c) => c.playerId);
        // At most 10 candidates, so 10 bound parameters.
        const { results } = await db
            .prepare(
                `SELECT p."id" AS playerId, p."name" AS name, d."discordUserId" AS discordUserId, d."avatar" AS avatar
                 FROM "players" p
                 LEFT JOIN "discord_accounts" d ON d."playerId" = p."id" AND d."deletedAt" IS NULL
                 WHERE p."id" IN (${ids.map(() => '?').join(', ')})`,
            )
            .bind(...ids)
            .all<Identity>();
        return new Map(results.map((r) => [r.playerId, r]));
    }

    async function imageFor(candidate: Candidate, identity: Identity | undefined) {
        // The current name: a player renamed after the poll row was written has the avatar file
        // under the new name.
        const site = await fetchImage(siteAvatarUrl(baseUrl, identity?.name ?? candidate.nickname));
        if (site) return site;
        if (identity?.discordUserId && identity.avatar) {
            return fetchImage(discordAvatarUrl(identity.discordUserId, identity.avatar));
        }
        return null;
    }

    return async (candidates) => {
        const emojis: AvatarEmojis = new Map();
        if (candidates.length === 0) return emojis;
        const deadline = clock() + budgetMs;

        let existing: AppEmoji[];
        let identities: Map<number, Identity>;
        try {
            identities = await loadIdentities(candidates);
            const listed = (await (await discordCall('GET', appPath)).json()) as { items?: AppEmoji[] };
            existing = listed.items ?? [];
        } catch (error) {
            console.warn(JSON.stringify({ event: 'avatarEmojisSkipped', error: String(error) }));
            return emojis;
        }

        for (const candidate of candidates) {
            if (clock() >= deadline) {
                console.warn(JSON.stringify({ event: 'avatarEmojiBudgetSpent', playerId: candidate.playerId }));
                break;
            }
            const { playerId } = candidate;
            try {
                const image = await imageFor(candidate, identities.get(playerId));
                if (!image) continue;
                const name = emojiName(playerId, await sha256Hex(image.bytes));

                let emoji = existing.find((e) => e.name === name);
                if (!emoji) {
                    const created = (await (
                        await discordCall('POST', appPath, {
                            name,
                            image: `data:${image.type};base64,${toBase64(image.bytes)}`,
                        })
                    ).json()) as AppEmoji;
                    emoji = { id: created.id, name };
                    existing.push(emoji);
                }
                emojis.set(playerId, emoji.id);

                // Older versions of this player's avatar. Best effort: a failed delete only leaves
                // an unused emoji, and the next poll tries again.
                const old = new RegExp(`^av_${playerId}_[0-9a-f]{8}$`);
                for (const stale of existing.filter((e) => e.name !== name && old.test(e.name))) {
                    if (clock() >= deadline) break;
                    try {
                        await discordCall('DELETE', `${appPath}/${stale.id}`);
                        existing = existing.filter((e) => e.id !== stale.id);
                    } catch (error) {
                        console.warn(JSON.stringify({ event: 'avatarEmojiDeleteFailed', name: stale.name, error: String(error) }));
                    }
                }
            } catch (error) {
                emojis.delete(playerId);
                console.warn(JSON.stringify({ event: 'avatarEmojiFailed', playerId, error: String(error) }));
            }
        }
        return emojis;
    };
}
