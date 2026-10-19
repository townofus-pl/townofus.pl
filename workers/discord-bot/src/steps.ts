// Cron steps. Empty for now: the poll and signup tickets fill them in. Every step must be
// idempotent: check the state in D1 first, because the cron can fire again in the same hour.

import type { BotEnv } from './env';
import type { WarsawTime } from './schedule';
import { closeSignupMessages } from './signup/close';

/** Wednesday 17:00: End Poll on the open poll. */
export async function closePoll(_env: BotEnv, _time: WarsawTime): Promise<void> {}

/** Wednesday 18:00: disable the signup buttons and add the "closed" text. */
export async function closeSignups(env: BotEnv, time: WarsawTime): Promise<void> {
    const edited = await closeSignupMessages(env, time.date);
    console.log(JSON.stringify({ event: 'closeSignups', date: time.date, edited }));
}

/** Wednesday from 22:00: create the poll and the signup message when the day's games are over. */
export async function createPoll(_env: BotEnv, _time: WarsawTime): Promise<void> {}
