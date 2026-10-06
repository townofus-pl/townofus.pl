import { addGame, categorize, otherParts, type RoleBreakdown } from './statsBreakdown';

describe('categorize', () => {
    it('counts a Jailor execute and a Deputy shot as kills', () => {
        const c = categorize({ correctKills: 1, correctJailorExecutes: 2, incorrectDeputyShoots: 1 }, 4);
        expect(c.kills).toEqual({ correct: 3, incorrect: 1 });
    });

    it('puts prosecutes, revives and swaps under Other', () => {
        const c = categorize({ correctProsecutes: 1, incorrectAltruistRevives: 2, correctSwaps: 1 }, 4);
        expect(c.other).toEqual({ correct: 2, incorrect: 2 });
    });

    it('counts a Warden fortify as a protect from season 4, and as Other before', () => {
        expect(categorize({ correctWardenFortifies: 1 }, 4).protects.correct).toBe(1);
        expect(categorize({ correctWardenFortifies: 1 }, 3).protects.correct).toBe(0);
        expect(categorize({ correctWardenFortifies: 1 }, 3).other.correct).toBe(1);
    });
});

describe('addGame', () => {
    it('sums per role and counts the games of each role', () => {
        const b: RoleBreakdown = {};
        addGame(b, 'Spellslinger', { correctKills: 3 }, 4);
        addGame(b, 'Juggernaut', { correctKills: 5 }, 4);
        addGame(b, 'Juggernaut', { correctVotes: 2 }, 4);
        expect(b.Spellslinger.categories.kills.correct).toBe(3);
        expect(b.Juggernaut.games).toBe(2);
        expect(b.Juggernaut.categories.kills.correct).toBe(5);
        expect(b.Juggernaut.categories.votes.correct).toBe(2);
    });
});

describe('addGame role keys', () => {
    it('merges keys that show as the same role', () => {
        const b: RoleBreakdown = {};
        addGame(b, 'Plaguebearer', { correctGuesses: 1 }, 3);
        addGame(b, 'Pestilence', { incorrectGuesses: 1 }, 3);
        const rows = Object.keys(b);
        expect(rows).toHaveLength(1);
        expect(b[rows[0]].games).toBe(2);
    });
});

describe('Other', () => {
    it('counts Janitor cleans as correct Other', () => {
        expect(categorize({ janitorCleans: 2, correctSwaps: 1 }, 4).other).toEqual({ correct: 3, incorrect: 0 });
    });

    it("moves a Monarch's knighting from Protects to Other", () => {
        const c = categorize({ correctProtects: 1, incorrectProtects: 1 }, 4, 'Monarch');
        expect(c.protects).toEqual({ correct: 0, incorrect: 0 });
        expect(c.other).toEqual({ correct: 1, incorrect: 1 });
        expect(categorize({ correctProtects: 1 }, 4, 'Medic').protects.correct).toBe(1);
    });

    it('takes the Monarch role from the key when the rows are roles', () => {
        const b: RoleBreakdown = {};
        addGame(b, 'Monarch', { correctProtects: 1 }, 4);
        expect(b.Monarch.categories.other.correct).toBe(1);
        const byPlayer: RoleBreakdown = {};
        addGame(byPlayer, 'ziomson', { correctProtects: 1 }, 4, false, 'Monarch');
        expect(byPlayer.ziomson.categories.other.correct).toBe(1);
    });
});

describe('otherParts', () => {
    it('names a Monarch knighting and a Janitor clean on their own', () => {
        expect(otherParts({ correctProtects: 1 }, 4, 'Monarch')).toEqual([
            { word: 'Knight', plural: 's', correct: 1, incorrect: 0, verdict: true },
        ]);
        expect(otherParts({ janitorCleans: 2 }, 4, 'Janitor')[0]).toMatchObject({ word: 'Clean', correct: 2, verdict: false });
        expect(otherParts({ correctProtects: 1 }, 4, 'Medic')).toEqual([]);
    });
});
