// The poll message body. It shows nicknames only. The signup message is in signup/message.ts.

import type { Candidate } from './candidates';

/** Discord's limit for the text of one poll answer. */
export const MAX_ANSWER_LENGTH = 55;

/**
 * `nonce` with `enforce_nonce`: when Discord already created a message with this nonce in the
 * last few minutes, it returns that message instead of a second one.
 */
export function pollMessage(question: string, candidates: Candidate[], durationHours: number, nonce: string) {
    return {
        poll: {
            question: { text: question },
            answers: candidates.map((c) => ({ poll_media: { text: c.nickname.slice(0, MAX_ANSWER_LENGTH) } })),
            duration: durationHours,
            allow_multiselect: false,
        },
        nonce,
        enforce_nonce: true,
        allowed_mentions: { parse: [] },
    };
}
