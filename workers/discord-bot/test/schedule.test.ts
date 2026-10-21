import { describe, expect, it } from '@jest/globals';
import { pickStep, toWarsawTime } from '../src/schedule';

const stepAt = (utc: string) => pickStep(toWarsawTime(new Date(utc)));

// Every UTC hour the cron `*/10 15-20 * * WED` fires in.
const CRON_HOURS = [15, 16, 17, 18, 19, 20];

describe('toWarsawTime', () => {
    it('is UTC+2 in summer time', () => {
        expect(toWarsawTime(new Date('2026-10-21T15:00:00Z'))).toEqual({ date: '2026-10-21', weekday: 3, hour: 17, minute: 0 });
    });

    it('is UTC+1 in winter time', () => {
        expect(toWarsawTime(new Date('2026-10-28T15:00:00Z'))).toEqual({ date: '2026-10-28', weekday: 3, hour: 16, minute: 0 });
    });

    it('changes on 2026-10-25 at 01:00 UTC (03:00 CEST becomes 02:00 CET)', () => {
        expect(toWarsawTime(new Date('2026-10-25T00:30:00Z'))).toMatchObject({ date: '2026-10-25', hour: 2, minute: 30 });
        expect(toWarsawTime(new Date('2026-10-25T00:59:00Z'))).toMatchObject({ hour: 2, minute: 59 });
        expect(toWarsawTime(new Date('2026-10-25T01:00:00Z'))).toMatchObject({ hour: 2, minute: 0 });
        expect(toWarsawTime(new Date('2026-10-25T01:30:00Z'))).toMatchObject({ hour: 2, minute: 30 });
        expect(toWarsawTime(new Date('2026-10-25T02:00:00Z'))).toMatchObject({ hour: 3, minute: 0 });
    });

    it('rolls the date over at Warsaw midnight, not UTC midnight', () => {
        expect(toWarsawTime(new Date('2026-10-21T22:00:00Z'))).toMatchObject({ date: '2026-10-22', weekday: 4, hour: 0 });
    });
});

describe('pickStep', () => {
    it('summer time (Wednesday 2026-10-21): close poll 15 and 17-19 UTC, signups 16 UTC', () => {
        const steps = CRON_HOURS.map((h) => stepAt(`2026-10-21T${h}:00:00Z`));
        expect(steps).toEqual([
            'closePoll', // 17:00
            'closeSignups', // 18:00
            'closePoll', // 19:00, waits for the final tally
            'closePoll', // 20:00
            'closePoll', // 21:00
            null, // 22:00, the host creates the poll with /ankieta
        ]);
    });

    it('winter time (Wednesday 2026-10-28): close poll 16 and 18-20 UTC, signups 17 UTC', () => {
        const steps = CRON_HOURS.map((h) => stepAt(`2026-10-28T${h}:00:00Z`));
        expect(steps).toEqual([
            null, // 16:00
            'closePoll', // 17:00
            'closeSignups', // 18:00
            'closePoll', // 19:00, waits for the final tally
            'closePoll', // 20:00
            'closePoll', // 21:00
        ]);
    });

    it('runs a step on every tick of its local hour, so a later tick can retry', () => {
        expect(stepAt('2026-10-28T16:50:00Z')).toBe('closePoll');
        expect(stepAt('2026-10-28T17:00:00Z')).toBe('closeSignups');
        expect(stepAt('2026-10-28T21:50:00Z')).toBeNull(); // 22:50: no poll step any more
    });

    it('does nothing on other days', () => {
        expect(stepAt('2026-10-25T15:00:00Z')).toBeNull(); // Sunday of the change, 16:00 CET
        expect(stepAt('2026-10-22T15:00:00Z')).toBeNull(); // Thursday 17:00
    });
});
