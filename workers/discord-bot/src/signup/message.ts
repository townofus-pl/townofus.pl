// The signup message: its button custom_ids and its content. The poll step (#356) posts the
// message, the button handler (UPDATE_MESSAGE) and the 18:00 step (PATCH) rewrite it. All three
// use renderSignupMessage, so the message looks the same whoever wrote it last.

import { SIGNUP_JOIN_BUTTON, SIGNUP_LEAVE_BUTTON } from '../commands';
import type { BotEnv } from '../env';

export type SignupAction = 'join' | 'leave';

/** `signup:join:2026-10-21`. The date is the Wednesday of the session (Europe/Warsaw). */
export function signupCustomId(action: SignupAction, date: string): string {
    return `${action === 'join' ? SIGNUP_JOIN_BUTTON : SIGNUP_LEAVE_BUTTON}:${date}`;
}

const CUSTOM_ID = /^signup:(join|leave):(\d{4}-\d{2}-\d{2})$/;

/** `null` for anything that is not a signup button with a real calendar date. */
export function parseSignupCustomId(customId: string): { action: SignupAction; date: string } | null {
    const match = CUSTOM_ID.exec(customId);
    if (!match) return null;
    const date = match[2];
    const parsed = new Date(`${date}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return null;
    return { action: match[1] as SignupAction, date };
}

/** DD.MM, as in TEXT_SIGNUP's `{date}`. */
export function formatDayMonth(date: string): string {
    return `${date.slice(8, 10)}.${date.slice(5, 7)}`;
}

// Nicks are free text. Escape Markdown so `_x_` stays `_x_`, and never ping anyone.
export const escapeMarkdown = (text: string): string => text.replace(/[\\*_~`|>#[\]()-]/g, '\\$&');

const MAX_CONTENT = 2000;

export interface AllowedMentions {
    parse: [];
    roles?: string[];
}

export interface SignupMessage {
    content: string;
    components: unknown[];
    allowed_mentions: AllowedMentions;
}

/** `<@&id>` of DISCORD_PING_ROLE_ID, or '' when the var is empty. */
export function rolePing(env: Pick<BotEnv, 'DISCORD_PING_ROLE_ID'>): string {
    return env.DISCORD_PING_ROLE_ID ? `<@&${env.DISCORD_PING_ROLE_ID}>` : '';
}

/**
 * For the first send of a message: allows the ping of DISCORD_PING_ROLE_ID and nothing else.
 * Edits keep `{ parse: [] }`. Discord does not ping on an edit anyway.
 */
export function pingAllowedMentions(env: Pick<BotEnv, 'DISCORD_PING_ROLE_ID'>): AllowedMentions {
    return env.DISCORD_PING_ROLE_ID ? { parse: [], roles: [env.DISCORD_PING_ROLE_ID] } : { parse: [] };
}

/**
 * The signup message pings nobody: it goes out right after the poll, and the poll message
 * carries the role ping.
 */
export function renderSignupMessage(
    env: Pick<BotEnv, 'TEXT_SIGNUP' | 'TEXT_SIGNUP_LIST' | 'TEXT_SIGNUP_JOIN' | 'TEXT_SIGNUP_LEAVE' | 'TEXT_SIGNUP_CLOSED'>,
    date: string,
    names: string[],
    closed: boolean,
): SignupMessage {
    const day = formatDayMonth(date);
    const header = env.TEXT_SIGNUP.replace('{date}', day);
    const list = names.length
        ? names.map((name, i) => `${i + 1}. ${escapeMarkdown(name)}`).join('\n')
        : 'Na razie nikt.';
    const footer = closed ? `\n\n**${env.TEXT_SIGNUP_CLOSED}**` : '';
    let content = `${header}\n\n**${env.TEXT_SIGNUP_LIST.replace('{date}', day)}**\n${list}${footer}`;
    if (content.length > MAX_CONTENT) content = `${content.slice(0, MAX_CONTENT - footer.length - 2)}…${footer}`;

    return {
        content,
        components: [
            {
                type: 1, // ACTION_ROW
                components: [
                    { type: 2, style: 3, label: env.TEXT_SIGNUP_JOIN, custom_id: signupCustomId('join', date), disabled: closed },
                    { type: 2, style: 2, label: env.TEXT_SIGNUP_LEAVE, custom_id: signupCustomId('leave', date), disabled: closed },
                ],
            },
        ],
        allowed_mentions: { parse: [] },
    };
}
