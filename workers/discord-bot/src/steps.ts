// Cron steps. Empty for now: the poll and signup tickets fill them in. Every step must be
// idempotent: check the state in D1 first, because the cron can fire again in the same hour.

import type { BotEnv } from './env';
import { closePollStep } from './poll/closePoll';
import type { WarsawTime } from './schedule';
import { closeSignupMessages } from './signup/close';

/**
 * Wednesday 17:00: End Poll on the due poll. On the same ticks and on 19:00–21:59 (see pickStep),
 * save the vote counts once Discord has the final tally.
 */
export async function closePoll(env: BotEnv, _time: WarsawTime, now: number): Promise<void> {
    await closePollStep(env, now);
}

/** Wednesday 18:00: disable the signup buttons and add the "closed" text. */
export async function closeSignups(env: BotEnv, time: WarsawTime): Promise<void> {
    const edited = await closeSignupMessages(env, time.date);
    console.log(JSON.stringify({ event: 'closeSignups', date: time.date, edited }));
}
