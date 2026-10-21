import { getDatabaseClient } from '../db';
import { getGameData } from './getGameData';

jest.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: jest.fn() }));
jest.mock('../db', () => ({ getDatabaseClient: jest.fn() }));

const getClient = jest.mocked(getDatabaseClient);

// A games row as D1 gives it back, with the two Recorder columns set.
const row = {
    id: 7,
    gameIdentifier: '20261021_1900',
    startTime: new Date('2026-10-21T19:00:00.000Z'),
    endTime: new Date('2026-10-21T19:15:00.000Z'),
    map: 'Polus',
    maxTasks: 9,
    winnerTeam: 'Crewmate',
    winCondition: 'Crewmate Win',
    season: 6,
    modVersion: '1.2.0+test',
    winningFaction: 'Crewmate Win',
    recorderFriendCode: 'recorder#4242',
    recorderPlayerId: 4242,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    gamePlayerStatistics: [],
    meetings: [],
    gameActions: [],
};

describe('getGameData', () => {
    it('gives neither recorderFriendCode nor recorderPlayerId to the page (#287)', async () => {
        getClient.mockResolvedValue({
            game: { findFirst: jest.fn().mockResolvedValue(row) },
        } as unknown as Awaited<ReturnType<typeof getDatabaseClient>>);

        const data = await getGameData('20261021_1900');

        expect(data).not.toBeNull();
        const json = JSON.stringify(data);
        expect(json).not.toContain('recorder');
        expect(json).not.toContain('4242');
    });
});
