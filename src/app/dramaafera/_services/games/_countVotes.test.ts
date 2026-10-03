import { countVotes } from './_countVotes';

const vote = (name: string, isCorrect: boolean | null, detail: string | null = null) => ({
    isCorrect,
    detail,
    performer: { name },
});

describe('countVotes', () => {
    it('counts a weighted decision as that many votes', () => {
        const out = countVotes([vote('Mayor', true, '{"weight":3}'), vote('Mayor', false)]);
        expect(out.get('Mayor')).toEqual({ correct: 3, incorrect: 1 });
    });

    it('treats a vote with no weight, or a broken detail, as one vote', () => {
        const out = countVotes([vote('A', true, '{"isGuess":true}'), vote('A', true, 'not json')]);
        expect(out.get('A')).toEqual({ correct: 2, incorrect: 0 });
    });

    it('skips an unresolved verdict', () => {
        expect(countVotes([vote('A', null)]).has('A')).toBe(false);
    });
});
