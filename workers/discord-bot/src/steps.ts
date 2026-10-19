// Cron steps. Empty for now: the poll and signup tickets fill them in. Every step must be
// idempotent: check the state in D1 first, because the cron can fire again in the same hour.

import type { BotEnv } from './env';
import type { WarsawTime } from './schedule';

/** Wednesday 17:00: End Poll on the open poll. */
export async function closePoll(_env: BotEnv, _time: WarsawTime): Promise<void> {}

/** Wednesday 18:00: disable the signup buttons and add the "closed" text. */
export async function closeSignups(_env: BotEnv, _time: WarsawTime): Promise<void> {}

/** Wednesday from 22:00: create the poll and the signup message when the day's games are over. */
export async function createPoll(_env: BotEnv, _time: WarsawTime): Promise<void> {}
