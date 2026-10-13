import { upcomingSession } from './schedule';

describe('Wednesday signups in Warsaw', () => {
    it('keeps the same Wednesday until 22:00 and switches exactly at 22:00', () => {
        expect(upcomingSession(Date.parse('2026-10-14T19:59:59.999Z')).date).toBe('2026-10-14');
        expect(upcomingSession(Date.parse('2026-10-14T20:00:00.000Z')).date).toBe('2026-10-21');
        expect(upcomingSession(Date.parse('2026-10-15T09:00:00Z')).date).toBe('2026-10-21');
    });
    it('uses the offset on the target day over the spring DST change', () => {
        const session = upcomingSession(Date.parse('2026-03-25T21:00:00Z'));
        expect(session.date).toBe('2026-04-01');
        expect(new Date(session.closesAt).toISOString()).toBe('2026-04-01T20:00:00.000Z');
    });
    it('uses the offset on the target day over the autumn DST change', () => {
        const session = upcomingSession(Date.parse('2026-10-21T20:00:00Z'));
        expect(session.date).toBe('2026-10-28');
        expect(new Date(session.closesAt).toISOString()).toBe('2026-10-28T21:00:00.000Z');
    });
    it('handles the year boundary and derives the season from the Wednesday', () => {
        expect(upcomingSession(Date.parse('2026-12-30T21:00:00Z')).date).toBe('2027-01-06');
        expect(upcomingSession(Date.parse('2026-09-22T18:00:00Z')).season).toBe(4);
    });
});
