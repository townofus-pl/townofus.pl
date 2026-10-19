// The Discord REST calls the poll flow makes, on top of the signup client (channel history,
// message edits). An interface, so the tests can count the calls and make one fail.

import type { BotEnv } from '../env';
import { discordRest, type ChannelMessage, type SignupRest } from '../signup/rest';

const API = 'https://discord.com/api/v10';

/** A 429 with a wait up to this long is retried once in the same call. A longer wait fails. */
export const MAX_INLINE_RETRY_MS = 5_000;

export class DiscordApiError extends Error {
    /** The JSON error code from the body (e.g. 10008 Unknown Message), if there is one. */
    readonly code: number | undefined;

    constructor(
        readonly status: number,
        readonly body: string,
        /** On a 429: how long Discord asks to wait. */
        readonly retryAfterMs?: number,
    ) {
        super(`Discord API ${status}: ${body.slice(0, 200)}`);
        try {
            const code = (JSON.parse(body) as { code?: unknown }).code;
            this.code = typeof code === 'number' ? code : undefined;
        } catch {
            this.code = undefined;
        }
    }
}

/** A channel message as the poll code reads it. The bot sees `poll` on its own messages. */
export type PollChannelMessage = ChannelMessage & { poll?: unknown };

export interface DiscordRest extends SignupRest {
    /** `POST /channels/{id}/messages`. */
    createMessage(channelId: string, body: unknown): Promise<{ id: string }>;
    /** `PATCH /webhooks/{application}/{token}/messages/@original`: the follow-up of a deferred reply. */
    editOriginalResponse(applicationId: string, interactionToken: string, content: string): Promise<void>;
    listMessages(channelId: string, before?: string): Promise<PollChannelMessage[]>;
}

const RETRY_STATUSES = [404, 429, 500, 502, 503];

export function createDiscordRest(
    env: Pick<BotEnv, 'DISCORD_BOT_TOKEN'>,
    fetcher: typeof fetch = fetch,
    retryDelayMs = 750,
): DiscordRest {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    return {
        ...discordRest(env),
        async createMessage(channelId, body) {
            const response = await fetcher(`${API}/channels/${channelId}/messages`, {
                method: 'POST',
                headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) throw new DiscordApiError(response.status, await response.text());
            return (await response.json()) as { id: string };
        },
        async editOriginalResponse(applicationId, interactionToken, content) {
            // The edit can reach Discord before our deferred (type 5) response does. Discord then
            // answers 404, so try again a few times, as the signup follow-up does. The interaction
            // token in the path authorises the call, not the bot token.
            for (let attempt = 1; ; attempt++) {
                const response = await fetcher(`${API}/webhooks/${applicationId}/${interactionToken}/messages/@original`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
                });
                if (response.ok) return;
                if (attempt >= 3 || !RETRY_STATUSES.includes(response.status)) {
                    throw new DiscordApiError(response.status, await response.text());
                }
                await sleep(attempt * retryDelayMs);
            }
        },
    };
}

/** The part of a message object the poll close reads. */
export interface PollMessage {
    id: string;
    poll?: {
        /** ISO 8601. `null` for a poll without an end. */
        expiry: string | null;
        answers: { answer_id: number; poll_media: { text?: string } }[];
        /** Absent means "unknown", not "no votes". */
        results?: {
            is_finalized: boolean;
            /** An answer without an entry has no votes. */
            answer_counts: { id: number; count: number }[];
        };
    };
}

/** The calls of the 17:00 step. Separate from `DiscordRest`, so the create flow's fakes stay small. */
export interface DiscordPollRest {
    /** `POST /channels/{id}/polls/{message}/expire`: End Poll. Only the author can end a poll. */
    expirePoll(channelId: string, messageId: string): Promise<void>;
    /** `GET /channels/{id}/messages/{message}`. */
    getMessage(channelId: string, messageId: string): Promise<PollMessage>;
}

/** Seconds from the body's `retry_after`, else from the `Retry-After` header. */
function retryAfterMs(response: Response, body: string): number | undefined {
    let seconds = Number.NaN;
    try {
        seconds = Number((JSON.parse(body) as { retry_after?: unknown }).retry_after);
    } catch {
        // Not JSON. Use the header.
    }
    if (!Number.isFinite(seconds)) seconds = Number(response.headers.get('Retry-After'));
    return Number.isFinite(seconds) && seconds >= 0 ? Math.ceil(seconds * 1000) : undefined;
}

const realSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function createDiscordPollRest(
    env: Pick<BotEnv, 'DISCORD_BOT_TOKEN'>,
    fetcher: typeof fetch = fetch,
    sleep: (ms: number) => Promise<void> = realSleep,
): DiscordPollRest {
    async function call(method: 'GET' | 'POST', path: string): Promise<Response> {
        const init = { method, headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` } };
        // A 429 means Discord did not run the request, so one retry after the wait is safe. Other
        // errors (401 and 403 too) are never retried here.
        for (let attempt = 0; ; attempt++) {
            const response = await fetcher(`${API}${path}`, init);
            if (response.ok) return response;
            const text = await response.text();
            if (response.status !== 429) throw new DiscordApiError(response.status, text);
            const wait = retryAfterMs(response, text);
            if (attempt > 0 || wait === undefined || wait > MAX_INLINE_RETRY_MS) {
                throw new DiscordApiError(429, text, wait);
            }
            await sleep(wait);
        }
    }

    return {
        async expirePoll(channelId, messageId) {
            await call('POST', `/channels/${channelId}/polls/${messageId}/expire`);
        },
        async getMessage(channelId, messageId) {
            return (await (await call('GET', `/channels/${channelId}/messages/${messageId}`)).json()) as PollMessage;
        },
    };
}
