// The poll message body. It shows nicknames only. The signup message is in signup/message.ts.

import type { BotEnv } from '../env';
import { pingAllowedMentions, rolePing } from '../signup/message';
import type { Candidate } from './candidates';
import type { AvatarEmojis } from './emojis';

/** Discord's limit for the text of one poll answer. */
export const MAX_ANSWER_LENGTH = 55;

/**
 * `nonce` with `enforce_nonce`: when Discord already created a message with this nonce in the
 * last few minutes, it returns that message instead of a second one. With DISCORD_PING_ROLE_ID
 * set, the content pings that role (a poll message may have content) and nobody else. An answer
 * whose player has an entry in `emojis` shows that application emoji.
 */
export function pollMessage(
    env: Pick<BotEnv, 'DISCORD_PING_ROLE_ID'>,
    question: string,
    candidates: Candidate[],
    durationHours: number,
    nonce: string,
    emojis: AvatarEmojis = new Map(),
) {
    const ping = rolePing(env);
    return {
        ...(ping ? { content: ping } : {}),
        poll: {
            question: { text: question },
            answers: candidates.map((c) => {
                const emojiId = emojis.get(c.playerId);
                const text = c.nickname.slice(0, MAX_ANSWER_LENGTH);
                return { poll_media: emojiId ? { text, emoji: { id: emojiId } } : { text } };
            }),
            duration: durationHours,
            allow_multiselect: false,
        },
        nonce,
        enforce_nonce: true,
        allowed_mentions: pingAllowedMentions(env),
    };
}
