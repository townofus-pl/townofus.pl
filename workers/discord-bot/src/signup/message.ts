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

export interface SignupMessage {
    content: string;
    components: unknown[];
    allowed_mentions: { parse: [] };
}

export function renderSignupMessage(
    env: Pick<BotEnv, 'TEXT_SIGNUP' | 'TEXT_SIGNUP_CLOSED'>,
    date: string,
    names: string[],
    closed: boolean,
): SignupMessage {
    const header = env.TEXT_SIGNUP.replace('{date}', formatDayMonth(date));
    const list = names.length
        ? names.map((name, i) => `${i + 1}. ${escapeMarkdown(name)}`).join('\n')
        : 'Na razie nikt.';
    const footer = closed ? `\n\n**${env.TEXT_SIGNUP_CLOSED}**` : '';
    let content = `${header}\n\n**Gramy (${names.length}):**\n${list}${footer}`;
    if (content.length > MAX_CONTENT) content = `${content.slice(0, MAX_CONTENT - footer.length - 2)}…${footer}`;

    return {
        content,
        components: [
            {
                type: 1, // ACTION_ROW
                components: [
                    { type: 2, style: 3, label: 'Gram', custom_id: signupCustomId('join', date), disabled: closed },
                    { type: 2, style: 2, label: 'Wypisz mnie', custom_id: signupCustomId('leave', date), disabled: closed },
                ],
            },
        ],
        allowed_mentions: { parse: [] },
    };
}
