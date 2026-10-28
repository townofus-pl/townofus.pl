// Avatar emojis for the poll answers. Each candidate gets an application emoji made from their
// avatar, so the answer shows the face next to the nick.
//
// Image, in this order:
//   1. The site avatar: AVATAR_EMOJI_BASE_URL + "/<current player name>.png", resized by the
//      `cf.image` fetch options (SITE_IMAGE_CF). Do not use a /cdn-cgi/image/ URL: a Worker on
//      the townofus.pl zone gets a 404 for it. A 404 or a non-image goes to the next source.
//   2. The avatar of the Discord account linked in `discord_accounts`.
//   3. No emoji.
//
// The emoji name is `av_<playerId>_<first 8 hex of SHA-256 of the image>`. A changed avatar gives a
// new name, so the bot creates a new emoji and deletes the older versions of that player.
//
// This is decoration. Every failure (fetch, create, a 429 after one short retry, a timeout, the
// time budget) only removes the emoji of that answer. The budget is a hard cap: the resolver
// returns when it is spent, whatever is still in flight. The poll is always sent.

import type { BotEnv } from '../env';
import type { Candidate } from './candidates';
import { MAX_INLINE_RETRY_MS, retryAfterMs } from './discordApi';

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

/** Cloudflare image transformation for the site avatar request. Not used for the Discord CDN. */
export const SITE_IMAGE_CF = { image: { width: 128, height: 128, fit: 'cover', format: 'png' } } as const;

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

/** The state of one resolver call. */
interface Run {
    /** Set when the hard budget is spent: no new request starts. */
    stopped: boolean;
    /** The requests in flight, aborted when the budget is spent. */
    controllers: Set<AbortController>;
}

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

    /**
     * One request with a timeout. `read` consumes the body inside the timeout: the signal stays
     * armed until the body is fully read, so a body that never ends is cut too. The race also
     * covers a fetcher that ignores the signal. `run.stopped` (the hard budget) aborts it at once.
     */
    async function timedFetch<T>(
        run: Run,
        url: string,
        init: RequestInit,
        read: (response: Response) => Promise<T>,
    ): Promise<T> {
        if (run.stopped) throw new EmojiError(`emoji budget spent: ${url}`);
        const controller = new AbortController();
        const aborted = new Promise<never>((_, reject) => {
            controller.signal.addEventListener('abort', () => reject(controller.signal.reason), { once: true });
        });
        const timer = setTimeout(
            () => controller.abort(new EmojiError(`timeout after ${timeoutMs} ms: ${url}`)),
            timeoutMs,
        );
        run.controllers.add(controller);
        try {
            return await Promise.race([fetcher(url, { ...init, signal: controller.signal }).then(read), aborted]);
        } finally {
            clearTimeout(timer);
            run.controllers.delete(controller);
        }
    }

    /** A Discord call. A 429 with a short wait gets one retry. Returns the parsed JSON body, or null. */
    async function discordCall(run: Run, method: string, url: string, body?: unknown): Promise<unknown> {
        const init: RequestInit = {
            method,
            headers: body === undefined ? auth : { ...auth, 'Content-Type': 'application/json' },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        };
        for (let attempt = 0; ; attempt++) {
            const { response, text } = await timedFetch(run, url, init, async (r) => ({ response: r, text: await r.text() }));
            if (response.ok) return text === '' ? null : JSON.parse(text);
            if (response.status === 429 && attempt === 0) {
                const wait = retryAfterMs(response, text);
                if (wait !== undefined && wait <= MAX_INLINE_RETRY_MS) {
                    await sleep(wait);
                    continue;
                }
            }
            throw new EmojiError(`Discord ${method} ${response.status}: ${text.slice(0, 200)}`);
        }
    }

    /**
     * The image bytes and type, or null. Each null logs one `avatarImageRejected` line with the
     * reason. `cf` is set only for the site avatar request.
     */
    async function fetchImage(
        run: Run,
        url: string,
        init: RequestInit = {},
    ): Promise<{ bytes: ArrayBuffer; type: string } | null> {
        try {
            return await timedFetch(run, url, init, async (response) => {
                const type = (response.headers.get('Content-Type') ?? '').split(';')[0].trim().toLowerCase();
                const contentLength = response.headers.get('Content-Length');
                const reject = (reason: 'status' | 'type' | 'size' | 'empty', bytes?: number) => {
                    console.warn(
                        JSON.stringify({
                            event: 'avatarImageRejected',
                            url,
                            status: response.status,
                            type,
                            ...(bytes === undefined ? { contentLength } : { bytes }),
                            reason,
                        }),
                    );
                    return null;
                };
                if (!response.ok) return reject('status');
                if (!IMAGE_TYPES.includes(type)) return reject('type');
                const length = Number(contentLength);
                if (contentLength !== null && Number.isFinite(length) && length > MAX_EMOJI_BYTES) return reject('size');
                const bytes = await response.arrayBuffer();
                if (bytes.byteLength === 0) return reject('empty', 0);
                if (bytes.byteLength > MAX_EMOJI_BYTES) return reject('size', bytes.byteLength);
                return { bytes, type };
            });
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

    async function imageFor(run: Run, candidate: Candidate, identity: Identity | undefined) {
        // The current name: a player renamed after the poll row was written has the avatar file
        // under the new name.
        const site = await fetchImage(run, siteAvatarUrl(baseUrl, identity?.name ?? candidate.nickname), {
            cf: SITE_IMAGE_CF,
        } as RequestInit);
        if (site) return site;
        if (identity?.discordUserId && identity.avatar) {
            return fetchImage(run, discordAvatarUrl(identity.discordUserId, identity.avatar));
        }
        return null;
    }

    /**
     * The hard cap: after `budgetMs` the resolver returns the emojis that are ready, whatever the
     * work is waiting for (a request, a body that never ends, D1). Every request still open is
     * aborted and no new one starts, so nothing left behind blocks the poll send.
     */
    return async (candidates) => {
        const emojis: AvatarEmojis = new Map();
        if (candidates.length === 0) return emojis;
        const startedAt = clock();
        const run: Run = { stopped: false, controllers: new Set() };
        let timer: ReturnType<typeof setTimeout> | undefined;
        const cutoff = new Promise<'cutoff'>((resolve) => {
            timer = setTimeout(() => resolve('cutoff'), budgetMs);
        });
        const work = resolveAll(run, candidates, emojis, clock() + budgetMs)
            .then(() => 'done' as const)
            .catch((error: unknown) => {
                console.warn(JSON.stringify({ event: 'avatarEmojisFailed', error: String(error) }));
                return 'done' as const;
            });
        try {
            if ((await Promise.race([work, cutoff])) === 'cutoff') {
                console.warn(JSON.stringify({ event: 'avatarEmojiBudgetSpent', ready: emojis.size }));
            }
        } finally {
            clearTimeout(timer);
            run.stopped = true;
            for (const controller of run.controllers) controller.abort(new EmojiError('emoji budget spent'));
            // One summary line for each run. `ready: 0` with candidates shows a silent failure.
            console.warn(
                JSON.stringify({
                    event: 'avatarEmojis',
                    candidates: candidates.length,
                    ready: emojis.size,
                    ms: clock() - startedAt,
                }),
            );
        }
        // A copy: work cut by the budget can still settle later, and must not change the poll.
        return new Map(emojis);
    };

    async function resolveAll(run: Run, candidates: Candidate[], emojis: AvatarEmojis, deadline: number) {
        let existing: AppEmoji[];
        let identities: Map<number, Identity>;
        try {
            identities = await loadIdentities(candidates);
            const listed = (await discordCall(run, 'GET', appPath)) as { items?: AppEmoji[] } | null;
            existing = listed?.items ?? [];
        } catch (error) {
            console.warn(JSON.stringify({ event: 'avatarEmojisSkipped', error: String(error) }));
            return;
        }

        for (const candidate of candidates) {
            if (run.stopped) return;
            if (clock() >= deadline) {
                console.warn(JSON.stringify({ event: 'avatarEmojiBudgetSpent', playerId: candidate.playerId }));
                break;
            }
            const { playerId } = candidate;
            try {
                const image = await imageFor(run, candidate, identities.get(playerId));
                if (!image) continue;
                const name = emojiName(playerId, await sha256Hex(image.bytes));

                let emoji = existing.find((e) => e.name === name);
                if (!emoji) {
                    const created = (await discordCall(run, 'POST', appPath, {
                        name,
                        image: `data:${image.type};base64,${toBase64(image.bytes)}`,
                    })) as AppEmoji;
                    emoji = { id: created.id, name };
                    existing.push(emoji);
                }
                emojis.set(playerId, emoji.id);

                // Older versions of this player's avatar. Best effort: a failed delete only leaves
                // an unused emoji, and the next poll tries again.
                const old = new RegExp(`^av_${playerId}_[0-9a-f]{8}$`);
                for (const stale of existing.filter((e) => e.name !== name && old.test(e.name))) {
                    if (run.stopped || clock() >= deadline) break;
                    try {
                        await discordCall(run, 'DELETE', `${appPath}/${stale.id}`);
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
    }
}
