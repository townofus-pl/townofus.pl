// The poll message body. It shows nicknames only. The signup message is in signup/message.ts.

import type { BotEnv } from '../env';
import { pingAllowedMentions, rolePing } from '../signup/message';
import type { Candidate } from './candidates';

/** Discord's limit for the text of one poll answer. */
export const MAX_ANSWER_LENGTH = 55;

/**
 * `nonce` with `enforce_nonce`: when Discord already created a message with this nonce in the
 * last few minutes, it returns that message instead of a second one. With DISCORD_PING_ROLE_ID
 * set, the content pings that role (a poll message may have content) and nobody else.
 */
export function pollMessage(
    env: Pick<BotEnv, 'DISCORD_PING_ROLE_ID'>,
    question: string,
    candidates: Candidate[],
    durationHours: number,
    nonce: string,
) {
    const ping = rolePing(env);
    return {
        ...(ping ? { content: ping } : {}),
        poll: {
            question: { text: question },
            answers: candidates.map((c) => ({ poll_media: { text: c.nickname.slice(0, MAX_ANSWER_LENGTH) } })),
            duration: durationHours,
            allow_multiselect: false,
        },
        nonce,
        enforce_nonce: true,
        allowed_mentions: pingAllowedMentions(env),
    };
}
