// Wednesday 18:00: disable the buttons on the signup message and add TEXT_SIGNUP_CLOSED.
//
// Finding the message needs no table: the bot reads the channel history and takes its own
// messages (author.id = DISCORD_APPLICATION_ID, the bot user's ID) that carry the button
// `signup:join:<date>`. Another app's message (dev, staging) on the same channel is skipped, so
// a 403 on its PATCH cannot block ours. The custom_id holds the date, so it identifies the
// message exactly. A bot can read the components of its own messages without the
// MESSAGE_CONTENT intent, and READ_MESSAGE_HISTORY is already in the bot's permissions. The
// message is posted the Wednesday before, so the search stops at messages older than 8 days.
//
// Idempotent: a message whose buttons are already disabled is skipped, so every 10-minute tick
// in the 18:00 hour can retry a failed edit.

import type { BotEnv } from '../env';
import { renderSignupMessage, signupCustomId } from './message';
import { discordRest, type ChannelMessage, type SignupRest } from './rest';
import { readRoster, seasonForSession } from './roster';

const MAX_PAGES = 5;
const SEARCH_WINDOW_MS = 8 * 24 * 3_600_000;

const buttons = (message: ChannelMessage) => (message.components ?? []).flatMap((row) => row.components ?? []);

export async function findSignupMessages(
    rest: SignupRest,
    channelId: string,
    botUserId: string,
    date: string,
): Promise<ChannelMessage[]> {
    const joinId = signupCustomId('join', date);
    const oldest = Date.parse(`${date}T00:00:00Z`) - SEARCH_WINDOW_MS;
    const found: ChannelMessage[] = [];
    let before: string | undefined;
    for (let page = 0; page < MAX_PAGES; page++) {
        const messages = await rest.listMessages(channelId, before);
        for (const message of messages) {
            if (message.author?.id === botUserId && buttons(message).some((b) => b.custom_id === joinId)) found.push(message);
        }
        const last = messages[messages.length - 1];
        if (messages.length < 100 || !last || Date.parse(last.timestamp) < oldest) break;
        before = last.id;
    }
    return found;
}

/** Returns how many messages it edited. */
export async function closeSignupMessages(
    env: BotEnv,
    date: string,
    rest: SignupRest = discordRest(env),
): Promise<number> {
    const open = (await findSignupMessages(rest, env.DISCORD_CHANNEL_ID, env.DISCORD_APPLICATION_ID, date)).filter((message) =>
        buttons(message).some((b) => !b.disabled),
    );
    if (open.length === 0) return 0;

    const names = await readRoster(env.DB, seasonForSession(date), date);
    const message = renderSignupMessage(env, date, names, true);
    for (const { id } of open) await rest.editMessage(env.DISCORD_CHANNEL_ID, id, message);
    return open.length;
}
