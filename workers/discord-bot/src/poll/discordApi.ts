// The Discord REST calls the poll flow makes, on top of the signup client (channel history,
// message edits). An interface, so the tests can count the calls and make one fail.

import type { BotEnv } from '../env';
import { discordRest, type ChannelMessage, type SignupRest } from '../signup/rest';

const API = 'https://discord.com/api/v10';

export class DiscordApiError extends Error {
    constructor(
        readonly status: number,
        readonly body: string,
    ) {
        super(`Discord API ${status}: ${body.slice(0, 200)}`);
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
