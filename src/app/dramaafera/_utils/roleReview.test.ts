import { compareReviewBoundary, isInRoleReviewWindow, toReviewTime } from './roleReview';
test('SQLite wall-clock strings and ISO UTC use the same boundary regardless of host timezone', () => {
    expect(toReviewTime('2026-10-24 20:00:00')).toBe('2026-10-24T20:00:00.000Z');
    expect(toReviewTime('2026-10-24T20:00:00+00:00')).toBe('2026-10-24T20:00:00.000Z');
});
test('a reviewed game is excluded from the next cycle and equal timestamps use game ids', () => {
    const after = { time: '2026-10-24T20:00:00.000Z', gameId: 10 };
    const through = { time: '2026-10-24T20:00:00.000Z', gameId: 12 };
    expect(isInRoleReviewWindow(after, { after, through })).toBe(false);
    expect(isInRoleReviewWindow({ ...after, gameId: 11 }, { after, through })).toBe(true);
    expect(isInRoleReviewWindow(through, { after, through })).toBe(true);
    expect(isInRoleReviewWindow({ ...through, gameId: 13 }, { after, through })).toBe(false);
    expect(compareReviewBoundary(after, through)).toBeLessThan(0);
});
