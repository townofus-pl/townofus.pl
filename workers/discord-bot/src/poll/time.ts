// Date arithmetic for the poll. Session dates are YYYY-MM-DD in Europe/Warsaw. Instants are epoch
// ms (UTC). Discord counts `duration` in whole hours from the moment it receives the poll, so the
// close time must be computed in UTC: the week can contain a DST change.

import { toWarsawTime } from '../schedule';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const WEDNESDAY = 3;

/** Discord's limit for `poll.duration`: 32 days. */
export const MAX_POLL_DURATION_HOURS = 32 * 24;

/** The Warsaw hour on the next Wednesday when the cron ends the poll. */
export const POLL_CLOSE_HOUR = 17;

function dateToUtcMidnight(date: string): number {
    const [y, m, d] = date.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
}

export function addDays(date: string, days: number): string {
    return new Date(dateToUtcMidnight(date) + days * DAY_MS).toISOString().slice(0, 10);
}

/** The first Wednesday strictly after `date`. A Wednesday session gives the Wednesday a week later. */
export function nextWednesday(date: string): string {
    const weekday = new Date(dateToUtcMidnight(date)).getUTCDay();
    return addDays(date, (WEDNESDAY - weekday + 7) % 7 || 7);
}

/** The UTC instant of a full hour on a Warsaw date. */
export function warsawHourToUtc(date: string, hour: number): number {
    const wall = dateToUtcMidnight(date) + hour * HOUR_MS;
    let utc = wall;
    // Two rounds converge: the first finds the offset, the second fixes a guess on the far side
    // of a DST change.
    for (let i = 0; i < 2; i++) {
        const seen = toWarsawTime(new Date(utc));
        utc += wall - (dateToUtcMidnight(seen.date) + seen.hour * HOUR_MS + seen.minute * 60_000);
    }
    return utc;
}

/** Planned close of the poll for a session: next Wednesday 17:00 in Warsaw, epoch ms. */
export function pollClosesAt(sessionDate: string): number {
    return warsawHourToUtc(nextWednesday(sessionDate), POLL_CLOSE_HOUR);
}

/**
 * Whole hours from `now` that reach past `closesAt` with at least one hour to spare. The 17:00
 * cron step ends the poll. The spare hour keeps Discord from ending it first.
 */
export function pollDurationHours(now: number, closesAt: number): number {
    const hours = Math.ceil((closesAt - now) / HOUR_MS) + 1;
    return Math.min(Math.max(hours, 1), MAX_POLL_DURATION_HOURS);
}

/**
 * Games store their start as Warsaw wall clock, and `gameIdentifier` is `YYYYMMDD_HHMM` of that
 * wall clock. This gives the identifier of the instant `ms`, for range comparisons.
 */
export function gameIdentifierAt(ms: number): string {
    const t = toWarsawTime(new Date(ms));
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${t.date.replace(/-/g, '')}_${pad(t.hour)}${pad(t.minute)}`;
}

/** `YYYYMMDD…` → `YYYY-MM-DD`. */
export function dateOfGameIdentifier(gameIdentifier: string): string {
    return `${gameIdentifier.slice(0, 4)}-${gameIdentifier.slice(4, 6)}-${gameIdentifier.slice(6, 8)}`;
}

/** Inclusive lower and exclusive upper `gameIdentifier` bound for a session date. */
export function gameIdentifierRange(date: string): [string, string] {
    return [date.replace(/-/g, ''), addDays(date, 1).replace(/-/g, '')];
}

/**
 * DATETIME columns hold two text formats: `CURRENT_TIMESTAMP` writes `YYYY-MM-DD HH:MM:SS` (UTC),
 * Prisma writes ISO 8601 with `+00:00`. Returns epoch ms, or NaN for anything else.
 */
export function parseDbTimestamp(value: string): number {
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) return Date.parse(`${value.replace(' ', 'T')}Z`);
    return Date.parse(value);
}

/** The format Prisma writes for DATETIME, so rows written by the bot read like the site's. */
export function toDbTimestamp(ms: number): string {
    return new Date(ms).toISOString().replace('Z', '+00:00');
}
