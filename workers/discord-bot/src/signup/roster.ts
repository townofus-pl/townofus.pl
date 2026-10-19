// The Lista Cweli row (`lista_cweli.playerNames`, a JSON array of names) for one session.
//
// Join and leave are one SQL statement each on the JSON stored at that moment, the pattern of
// `changeSignup` on the `Discord` branch (PR #346). The bot never writes a list it read earlier,
// so a host edit in the panel between two clicks stays. Names compare with NOCASE, so
// "quarties" typed by the host and "Quarties" from the bot are one person. NOCASE folds ASCII
// only ("łoś" ≠ "Łoś"). The bot always writes a matched player's own spelling, so this matters
// only for a name the host typed in another case.
//
// The SQL clock also checks the deadline, so a click that arrives late cannot change the list.

import { getSeasonForDate } from '../../../../src/app/dramaafera/_constants/seasons';
import { toWarsawTime } from '../schedule';
import { SQL_NOW } from './identity';

const SQL_NOW_MS = `CAST(unixepoch('subsec') * 1000 AS INTEGER)`;

/** Signups close on the session day at 18:00 Europe/Warsaw. */
export const CLOSE_HOUR = 18;

/** The UTC instant (ms) of 18:00 in Warsaw on `date`. Warsaw is UTC+1 or UTC+2. */
export function signupClosesAt(date: string): number {
    const local = Date.parse(`${date}T${String(CLOSE_HOUR).padStart(2, '0')}:00:00Z`);
    for (const offsetHours of [1, 2]) {
        const instant = local - offsetHours * 3_600_000;
        const time = toWarsawTime(new Date(instant));
        if (time.date === date && time.hour === CLOSE_HOUR && time.minute === 0) return instant;
    }
    throw new Error(`No 18:00 in Warsaw on ${date}`);
}

/** The season of a session, by the site's rule (the date decides, not "now"). */
export function seasonForSession(date: string): number {
    return getSeasonForDate(new Date(date));
}

// The site stores the session date as Prisma DateTime text, midnight UTC.
const storedDate = (date: string) => `${date}T00:00:00.000+00:00`;

const parse = (json: string | undefined | null): string[] => (json ? (JSON.parse(json) as string[]) : []);

export async function readRoster(db: D1Database, season: number, date: string): Promise<string[]> {
    const row = await db
        .prepare(
            `SELECT playerNames FROM lista_cweli
             WHERE season = ? AND date(date) = ? AND deletedAt IS NULL LIMIT 1`,
        )
        .bind(season, date)
        .first<{ playerNames: string }>();
    return parse(row?.playerNames);
}

/**
 * Adds `name` unless it is there already. Creates the row when the session has none, and revives
 * a soft-deleted one with only this name (as changeSignup does). `null` after the deadline.
 */
export async function joinRoster(
    db: D1Database,
    season: number,
    date: string,
    name: string,
    closesAt: number,
): Promise<string[] | null> {
    const row = await db
        .prepare(
            `INSERT INTO lista_cweli (season, date, playerNames, createdAt, updatedAt)
             SELECT ?1,
                    COALESCE((SELECT date FROM lista_cweli WHERE season = ?1 AND date(date) = ?2 LIMIT 1), ?3),
                    json_array(?4), ${SQL_NOW}, ${SQL_NOW}
             WHERE ${SQL_NOW_MS} < ?5
             ON CONFLICT (season, date) DO UPDATE SET
                playerNames = CASE
                    WHEN lista_cweli.deletedAt IS NOT NULL THEN excluded.playerNames
                    WHEN EXISTS (SELECT 1 FROM json_each(lista_cweli.playerNames)
                                 WHERE value = ?4 COLLATE NOCASE) THEN lista_cweli.playerNames
                    ELSE json_insert(lista_cweli.playerNames, '$[#]', ?4)
                END,
                deletedAt = NULL,
                updatedAt = excluded.updatedAt
             RETURNING playerNames`,
        )
        .bind(season, date, storedDate(date), name, closesAt)
        .first<{ playerNames: string }>();
    return row ? parse(row.playerNames) : null;
}

/** Removes `name` (any case). A leave from a missing list is a no-op. `null` after the deadline. */
export async function leaveRoster(
    db: D1Database,
    season: number,
    date: string,
    name: string,
    closesAt: number,
): Promise<string[] | null> {
    const row = await db
        .prepare(
            `UPDATE lista_cweli SET
                playerNames = COALESCE((SELECT json_group_array(value) FROM json_each(lista_cweli.playerNames)
                                        WHERE value <> ?3 COLLATE NOCASE), '[]'),
                updatedAt = ${SQL_NOW}
             WHERE season = ?1 AND date(date) = ?2 AND deletedAt IS NULL AND ${SQL_NOW_MS} < ?4
             RETURNING playerNames`,
        )
        .bind(season, date, name, closesAt)
        .first<{ playerNames: string }>();
    if (row) return parse(row.playerNames);
    if (Date.now() >= closesAt) return null;
    return readRoster(db, season, date);
}
