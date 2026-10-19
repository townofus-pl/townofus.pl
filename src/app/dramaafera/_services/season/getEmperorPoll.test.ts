import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDatabaseClient } from '../db';
import { getEmperorPoll, mapEmperorPoll, toPollDate } from './getEmperorPoll';

jest.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: jest.fn() }));
jest.mock('../db', () => ({ getDatabaseClient: jest.fn() }));

// getCloudflareContext is overloaded, so jest.mocked cannot type its resolved value.
const getContext = getCloudflareContext as unknown as jest.Mock;
const getClient = jest.mocked(getDatabaseClient);

const findFirst = jest.fn();
const assetsFetch = jest.fn();

const QUESTION = 'KTO ZOSTANIE EMPEROREM PO DZISIEJSZEJ SESJI?';

const jsonPoll = {
    date: '20260923',
    question: 'KTO BĘDZIE EMPEROREM PO DZIŚ?',
    totalVotes: 3,
    votes: [{ nickname: 'Malkiz', votes: 3 }],
};

beforeEach(() => {
    findFirst.mockReset();
    assetsFetch.mockReset();
    getClient.mockResolvedValue({ emperorPoll: { findFirst } } as unknown as Awaited<ReturnType<typeof getDatabaseClient>>);
    getContext.mockResolvedValue({ env: { ASSETS: { fetch: assetsFetch } } });
    assetsFetch.mockResolvedValue(new Response(JSON.stringify(jsonPoll), { status: 200 }));
});

describe('toPollDate', () => {
    test('turns the URL date into the D1 date', () => {
        expect(toPollDate('20261021')).toBe('2026-10-21');
    });

    test.each(['2026-10-21', '2026102', 'abcdefgh', ''])('rejects %p', (date) => {
        expect(toPollDate(date)).toBeNull();
    });
});

describe('mapEmperorPoll', () => {
    test('gives the JSON shape, with the current player name and summed votes', () => {
        const poll = mapEmperorPoll('20261021', QUESTION, [
            { nickname: 'OldName', voteCount: 4, player: { name: 'NewName', deletedAt: null } },
            { nickname: 'Subek', voteCount: 0, player: { name: 'Subek', deletedAt: null } },
            { nickname: 'Olivka', voteCount: 2, player: { name: 'Olivka', deletedAt: null } },
        ]);
        expect(poll).toEqual({
            date: '20261021',
            question: QUESTION,
            totalVotes: 6,
            votes: [
                { nickname: 'NewName', votes: 4 },
                { nickname: 'Subek', votes: 0 },
                { nickname: 'Olivka', votes: 2 },
            ],
        });
    });

    test('falls back to the saved nickname when the player is missing or soft-deleted', () => {
        const poll = mapEmperorPoll('20261021', QUESTION, [
            { nickname: 'Gone', voteCount: 1, player: null },
            { nickname: 'Deleted', voteCount: 1, player: { name: 'Renamed', deletedAt: new Date() } },
        ]);
        expect(poll.votes.map((v) => v.nickname)).toEqual(['Gone', 'Deleted']);
    });

    test('keeps the question text the poll was sent with', () => {
        expect(mapEmperorPoll('20261021', 'Kto zostanie Emperorem?', []).question).toBe('Kto zostanie Emperorem?');
    });
});

describe('getEmperorPoll', () => {
    test('reads a finalized, not deleted poll for the date and season from D1', async () => {
        findFirst.mockResolvedValue({
            question: 'KTO BĘDZIE EMPEROREM PO DZIŚ?!',
            candidates: [{ nickname: 'ziomson', voteCount: 5, player: { name: 'ziomson', deletedAt: null } }],
        });

        const poll = await getEmperorPoll('20261021', 6);

        expect(poll).toEqual({
            date: '20261021',
            question: 'KTO BĘDZIE EMPEROREM PO DZIŚ?!',
            totalVotes: 5,
            votes: [{ nickname: 'ziomson', votes: 5 }],
        });
        expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: { deletedAt: null, date: '2026-10-21', season: 6, finalizedAt: { not: null } },
        }));
        expect(findFirst.mock.calls[0][0].select.question).toBe(true);
        expect(findFirst.mock.calls[0][0].select.candidates.where).toEqual({ deletedAt: null });
        expect(assetsFetch).not.toHaveBeenCalled();
    });

    test('falls back to the JSON file when D1 has no finalized poll', async () => {
        findFirst.mockResolvedValue(null);

        expect(await getEmperorPoll('20260923', 5)).toEqual(jsonPoll);
        const request = assetsFetch.mock.calls[0][0] as Request;
        expect(request.url).toBe('http://localhost/emperor-polls/20260923.json');
    });

    test('falls back to the JSON file when the D1 query fails', async () => {
        findFirst.mockRejectedValue(new Error('D1 down'));

        expect(await getEmperorPoll('20260923', 5)).toEqual(jsonPoll);
    });

    test('falls back to the JSON file when no database client exists', async () => {
        getClient.mockResolvedValue(null);

        expect(await getEmperorPoll('20260923', 5)).toEqual(jsonPoll);
    });

    test('skips D1 for a malformed date', async () => {
        await getEmperorPoll('not-a-date', 5);

        expect(findFirst).not.toHaveBeenCalled();
    });

    test('gives null when neither D1 nor the JSON file has a poll', async () => {
        findFirst.mockResolvedValue(null);
        assetsFetch.mockResolvedValue(new Response('', { status: 404 }));

        expect(await getEmperorPoll('20200101', 1)).toBeNull();
    });

    test('gives null when the assets binding throws', async () => {
        findFirst.mockResolvedValue(null);
        assetsFetch.mockRejectedValue(new Error('no assets'));

        expect(await getEmperorPoll('20200101', 1)).toBeNull();
    });
});
