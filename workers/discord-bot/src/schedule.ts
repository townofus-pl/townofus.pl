// Which cron step to run.
//
// The cron (`*/10 15-20 * * WED`) runs in UTC. 17:00 in Warsaw is 15:00 UTC in summer time and
// 16:00 UTC in winter time, so the cron covers both and the code decides from the local time.
// A step runs on every tick inside its local hour, not only at :00. Each step must be
// idempotent, so a later tick retries a failed one.

import type { BotEnv } from './env';
import { closePoll, closeSignups } from './steps';

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

export type StepName = 'closePoll' | 'closeSignups';

const WEDNESDAY = 3;

/**
 * The step for a Warsaw time, or `null` when nothing is due.
 *
 * `closePoll` also runs from 19:00 to 21:59. There it finds the poll closed and only waits for
 * Discord's final tally (`is_finalized`). The tally usually ends long before 18:00. The extra
 * hours are a fallback, and they also retry an End Poll that failed at 17:00. 18:00 belongs to
 * the signups.
 *
 * The cron does not create the poll: the host runs `/ankieta` after the session (decision of
 * 2026-10-21, #361). Only the end of the session is a reliable trigger.
 */
export function pickStep(time: WarsawTime): StepName | null {
    if (time.weekday !== WEDNESDAY) return null;
    if (time.hour === 17 || (time.hour >= 19 && time.hour <= 21)) return 'closePoll';
    if (time.hour === 18) return 'closeSignups';
    return null;
}

/** `now` is the cron's time (epoch ms). `/__dev/tick?now=` sets it. */
export type Step = (env: BotEnv, time: WarsawTime, now: number) => Promise<void>;

const STEPS: Record<StepName, Step> = { closePoll, closeSignups };

export interface ScheduledRun {
    warsaw: WarsawTime;
    step: StepName | null;
}

export async function runScheduled(scheduledTime: number, env: BotEnv): Promise<ScheduledRun> {
    const warsaw = toWarsawTime(new Date(scheduledTime));
    const step = pickStep(warsaw);
    console.log(JSON.stringify({ event: 'scheduled', warsaw, step }));
    if (step) await STEPS[step](env, warsaw, scheduledTime);
    return { warsaw, step };
}
