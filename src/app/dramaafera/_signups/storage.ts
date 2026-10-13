import { upcomingSession } from './schedule';
import type { UpcomingRoster } from './types';

export async function readUpcomingRoster(db: D1Database): Promise<UpcomingRoster> {
    const schedule = upcomingSession();
    const list = await db.prepare(`SELECT playerNames FROM lista_cweli
        WHERE season=? AND date(date)=? AND deletedAt IS NULL LIMIT 1`)
        .bind(schedule.season, schedule.date).first<{ playerNames: string }>();
    const revision = list?.playerNames ?? '[]';
    return { ...schedule, playerNames: JSON.parse(revision) as string[], revision };
}

// Every write re-resolves the live account's Player.id, never a nickname supplied by the browser.
// The SQL clock prevents an in-flight request from changing last week's list after 22:00.
const activePlayer = `SELECT p.name FROM discord_sessions s JOIN discord_accounts a ON a.id=s.accountId
    JOIN players p ON p.id=a.playerId WHERE s.tokenHash=?
    AND s.expiresAt>CAST(unixepoch('subsec')*1000 AS INTEGER)
    AND s.deletedAt IS NULL AND a.deletedAt IS NULL AND p.deletedAt IS NULL`;

export async function changeSignup(db: D1Database, tokenHash: string, expectedDate: string, join: boolean) {
    const schedule = upcomingSession();
    if (expectedDate !== schedule.date) return false;
    const result = join
        ? await db.prepare(`INSERT INTO lista_cweli(season,date,playerNames,updatedAt)
            SELECT ?,COALESCE((SELECT date FROM lista_cweli WHERE season=? AND date(date)=? LIMIT 1),?),
                json_array(p.name),CURRENT_TIMESTAMP FROM (${activePlayer}) p
            WHERE CAST(unixepoch('subsec')*1000 AS INTEGER)<?
            ON CONFLICT(season,date) DO UPDATE SET
                playerNames=CASE WHEN lista_cweli.deletedAt IS NOT NULL THEN excluded.playerNames
                    WHEN EXISTS(SELECT 1 FROM json_each(lista_cweli.playerNames) WHERE value=json_extract(excluded.playerNames,'$[0]'))
                    THEN lista_cweli.playerNames ELSE json_insert(lista_cweli.playerNames,'$[#]',json_extract(excluded.playerNames,'$[0]')) END,
                deletedAt=NULL,updatedAt=CURRENT_TIMESTAMP`)
            .bind(schedule.season, schedule.season, schedule.date, `${schedule.date}T00:00:00.000Z`, tokenHash, schedule.closesAt).run()
        : await db.prepare(`UPDATE lista_cweli SET playerNames=COALESCE((SELECT json_group_array(value)
                FROM json_each(lista_cweli.playerNames) WHERE value<>(SELECT name FROM (${activePlayer}))), '[]'),
                updatedAt=CURRENT_TIMESTAMP
            WHERE season=? AND date(date)=? AND deletedAt IS NULL
            AND EXISTS(${activePlayer}) AND CAST(unixepoch('subsec')*1000 AS INTEGER)<?`)
            .bind(tokenHash, schedule.season, schedule.date, tokenHash, schedule.closesAt).run();
    // A withdrawal from an empty list is also successful for a valid linked account.
    if (!join && result.meta.changes === 0) {
        return !!await db.prepare(`SELECT name FROM (${activePlayer})
            WHERE CAST(unixepoch('subsec')*1000 AS INTEGER)<?`).bind(tokenHash, schedule.closesAt).first();
    }
    return result.meta.changes > 0;
}

/** Optimistic comparison prevents a host draft from overwriting new public signups. */
export async function saveUpcomingRoster(
    db: D1Database, expectedDate: string, playerNames: string[], revision: string, hostTokenHash: string | null,
) {
    const schedule = upcomingSession();
    if (expectedDate !== schedule.date) return false;
    const result = await db.prepare(`INSERT INTO lista_cweli(season,date,playerNames,updatedAt)
        SELECT ?,COALESCE((SELECT date FROM lista_cweli WHERE season=? AND date(date)=? LIMIT 1),?),?,CURRENT_TIMESTAMP
        WHERE CAST(unixepoch('subsec')*1000 AS INTEGER)<?
        AND (? IS NULL OR EXISTS(SELECT 1 FROM discord_sessions s JOIN discord_accounts a ON a.id=s.accountId
            WHERE s.tokenHash=? AND s.expiresAt>CAST(unixepoch('subsec')*1000 AS INTEGER)
            AND s.deletedAt IS NULL AND a.deletedAt IS NULL AND a.isHost=1))
        ON CONFLICT(season,date) DO UPDATE SET playerNames=excluded.playerNames,deletedAt=NULL,updatedAt=CURRENT_TIMESTAMP
        WHERE CASE WHEN lista_cweli.deletedAt IS NULL THEN lista_cweli.playerNames ELSE '[]' END=?`)
        .bind(schedule.season, schedule.season, schedule.date, `${schedule.date}T00:00:00.000Z`, JSON.stringify(playerNames),
            schedule.closesAt, hostTokenHash, hostTokenHash, revision).run();
    return result.meta.changes === 1;
}
