// Which cron step to run.
//
// The cron (`*/10 15-22 * * WED`) runs in UTC. 17:00 in Warsaw is 15:00 UTC in summer time and
// 16:00 UTC in winter time, so the cron covers both and the code decides from the local time.
// A step runs on every tick inside its local hour, not only at :00. Each step must be
// idempotent, so a later tick retries a failed one.

import type { BotEnv } from './env';
import { closePoll, closeSignups, createPoll } from './steps';

export const TIME_ZONE = 'Europe/Warsaw';

export interface WarsawTime {
    /** YYYY-MM-DD in Warsaw. */
    date: string;
    /** 0 = Sunday … 6 = Saturday, in Warsaw. */
    weekday: number;
    hour: number;
    minute: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

export function toWarsawTime(instant: Date): WarsawTime {
    const parts: Record<string, string> = {};
    for (const part of formatter.formatToParts(instant)) parts[part.type] = part.value;
    return {
        date: `${parts.year}-${parts.month}-${parts.day}`,
        weekday: WEEKDAYS.indexOf(parts.weekday),
        hour: Number(parts.hour),
        minute: Number(parts.minute),
    };
}

export type StepName = 'closePoll' | 'closeSignups' | 'createPoll';

const WEDNESDAY = 3;

/** The step for a Warsaw time, or `null` when nothing is due. */
export function pickStep(time: WarsawTime): StepName | null {
    if (time.weekday !== WEDNESDAY) return null;
    if (time.hour === 17) return 'closePoll';
    if (time.hour === 18) return 'closeSignups';
    if (time.hour >= 22) return 'createPoll';
    return null;
}

export type Step = (env: BotEnv, time: WarsawTime) => Promise<void>;

const STEPS: Record<StepName, Step> = { closePoll, closeSignups, createPoll };

export async function runScheduled(scheduledTime: number, env: BotEnv): Promise<StepName | null> {
    const time = toWarsawTime(new Date(scheduledTime));
    const step = pickStep(time);
    console.log(JSON.stringify({ event: 'scheduled', warsaw: time, step }));
    if (step) await STEPS[step](env, time);
    return step;
}
