import type { V2GamePayload, V2Player } from '@/app/api/schema/gamesV2';
import type { PrismaClient } from '@prisma/client';
import { findLivePlayerIdsByFriendCode, resolveRecorderPlayerId } from './recorder';

const player = (name: string, playerId: number, friendCode: string | null): V2Player =>
    ({
        name,
        playerId,
        friendCode,
        hashedProductUserId: null,
        roleHistory: ['Sheriff'],
        imitatorRoles: [],
        modifiersHistory: [],
        win: false,
        disconnected: false,
    }) as V2Player;

const payload = (recorderFriendCode: string, players: V2Player[]): V2GamePayload =>
    ({
        schemaVersion: '3.0.0',
        modVersion: '1.2.0+test',
        recorderFriendCode,
        players: Object.fromEntries(players.map((p) => [p.name, p])),
    }) as unknown as V2GamePayload;

describe('resolveRecorderPlayerId', () => {
    it('takes the id of the payload player with the same friend code, with no lookup', async () => {
        const find = jest.fn();
        const id = await resolveRecorderPlayerId(
            payload('quarties#1234', [player('Quarties', 1, 'quarties#1234'), player('Malkiz', 2, 'malkiz#9')]),
            new Map([[1, 101], [2, 102]]),
            find,
        );
        expect(id).toBe(101);
        expect(find).not.toHaveBeenCalled();
    });

    it('takes the one live player with the friend code when the Recorder is not in the payload', async () => {
        const find = jest.fn().mockResolvedValue([555]);
        const id = await resolveRecorderPlayerId(
            payload('observer#77', [player('Quarties', 1, 'quarties#1234')]),
            new Map([[1, 101]]),
            find,
        );
        expect(id).toBe(555);
        expect(find).toHaveBeenCalledWith('observer#77');
    });

    it.each([
        ['no player', []],
        ['two players', [555, 556]],
    ])('gives null for %s with the friend code, and does not reject', async (_label, ids) => {
        const id = await resolveRecorderPlayerId(
            payload('observer#77', [player('Quarties', 1, null)]),
            new Map([[1, 101]]),
            jest.fn().mockResolvedValue(ids),
        );
        expect(id).toBeNull();
    });
});

describe('findLivePlayerIdsByFriendCode', () => {
    it('asks D1 for live players with the friend code, at most two rows', async () => {
        const findMany = jest.fn().mockResolvedValue([{ id: 555 }, { id: 556 }]);
        const prisma = { player: { findMany } } as unknown as Pick<PrismaClient, 'player'>;

        const ids = await findLivePlayerIdsByFriendCode(prisma)('observer#77');

        expect(ids).toEqual([555, 556]);
        expect(findMany).toHaveBeenCalledWith({
            where: { friendCode: 'observer#77', deletedAt: null },
            select: { id: true },
            take: 2,
        });
    });
});
