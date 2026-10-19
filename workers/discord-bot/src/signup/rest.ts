// The Discord REST calls the signup code makes. Kept behind an interface so the tests run
// without the network.

import type { BotEnv } from '../env';
import type { SignupMessage } from './message';

const API = 'https://discord.com/api/v10';

export interface ChannelMessage {
    id: string;
    timestamp: string;
    author?: { id: string; bot?: boolean };
    components?: Array<{ components?: Array<{ custom_id?: string; disabled?: boolean }> }>;
}

export interface SignupRest {
    /** An ephemeral follow-up to an interaction. Needs no bot token, only the interaction token. */
    followup(applicationId: string, interactionToken: string, content: string): Promise<void>;
    /** Up to 100 messages, newest first, before message `before`. */
    listMessages(channelId: string, before?: string): Promise<ChannelMessage[]>;
    editMessage(channelId: string, messageId: string, message: SignupMessage): Promise<void>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function check(response: Response, what: string): Promise<Response> {
    if (!response.ok) throw new Error(`${what}: HTTP ${response.status} ${await response.text()}`);
    return response;
}

export function discordRest(env: Pick<BotEnv, 'DISCORD_BOT_TOKEN'>): SignupRest {
    const bot = { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`, 'Content-Type': 'application/json' };
    return {
        async followup(applicationId, interactionToken, content) {
            // The follow-up can reach Discord before our UPDATE_MESSAGE response does. Discord
            // then does not know the interaction yet, so try again a few times.
            for (let attempt = 1; ; attempt++) {
                const response = await fetch(`${API}/webhooks/${applicationId}/${interactionToken}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content, flags: 1 << 6, allowed_mentions: { parse: [] } }),
                });
                if (response.ok) return;
                if (attempt >= 3 || ![404, 429, 500, 502, 503].includes(response.status)) {
                    await check(response, 'followup');
                }
                await sleep(attempt * 750);
            }
        },
        async listMessages(channelId, before) {
            const query = new URLSearchParams({ limit: '100' });
            if (before) query.set('before', before);
            const response = await fetch(`${API}/channels/${channelId}/messages?${query}`, { headers: bot });
            return (await check(response, 'listMessages')).json();
        },
        async editMessage(channelId, messageId, message) {
            const response = await fetch(`${API}/channels/${channelId}/messages/${messageId}`, {
                method: 'PATCH',
                headers: bot,
                body: JSON.stringify(message),
            });
            await check(response, 'editMessage');
        },
    };
}
