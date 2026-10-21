/**
 * The Recorder of a v2 game: the machine that recorded the match. The payload names it by friend
 * code (`recorderFriendCode`). It is not always the lobby host — the host can change during a
 * match, and an observer can send its own copy. Both values stay in D1 only and never reach a
 * response body (#287). An admin reads them with `wrangler d1 execute`.
 */
import type { V2GamePayload } from '@/app/api/schema/gamesV2';

/** The live (not soft-deleted) player ids with this friend code. Two are enough to know it is not one. */
export type FindPlayerIdsByFriendCode = (friendCode: string) => Promise<number[]>;

/**
 * `games.recorderPlayerId` for a payload. Never rejects the upload.
 *
 * 1. A player in this payload has the same friend code: that player's id, as `resolvePlayers`
 *    already matched it by hash or by name.
 * 2. Else exactly one live player in `players` has the friend code: that id.
 * 3. Else (zero, or more than one): `null`.
 */
export async function resolveRecorderPlayerId(
    payload: V2GamePayload,
    dbIdByPlayerId: ReadonlyMap<number, number>,
    findByFriendCode: FindPlayerIdsByFriendCode,
): Promise<number | null> {
    const code = payload.recorderFriendCode;

    const inPayload = Object.values(payload.players).find((p) => p.friendCode === code);
    if (inPayload) {
        const id = dbIdByPlayerId.get(inPayload.playerId);
        if (id !== undefined) return id;
    }

    const ids = await findByFriendCode(code);
    return ids.length === 1 ? ids[0] : null;
}
