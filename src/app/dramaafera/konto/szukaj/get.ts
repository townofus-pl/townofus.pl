import { NextRequest } from 'next/server';
import { database, error, json, safeHandler, session } from '../../_accounts/server';
export async function GET(request: NextRequest) {
    return safeHandler(async () => {
        if (!(await session(request))) return error('Zaloguj się.', 401);
        const query = (request.nextUrl.searchParams.get('q') ?? '').trim();
        if (query.length < 2 || query.length > 80) return error('Wpisz od 2 do 80 znaków.');
        const cursor = Number(request.nextUrl.searchParams.get('cursor') ?? 0);
        if (!Number.isSafeInteger(cursor) || cursor < 0) return error('Nieprawidłowa strona.');
        const db = await database();
        const players = await db
            .prepare(
                `SELECT p.id,p.name,
 (SELECT count(*) FROM game_player_statistics s JOIN games g ON g.id=s.gameId WHERE s.playerId=p.id AND g.deletedAt IS NULL) games,
 (SELECT max(g.startTime) FROM game_player_statistics s JOIN games g ON g.id=s.gameId WHERE s.playerId=p.id AND g.deletedAt IS NULL) lastGame,
 (SELECT group_concat(DISTINCT g.season) FROM game_player_statistics s JOIN games g ON g.id=s.gameId WHERE s.playerId=p.id AND g.deletedAt IS NULL) seasons
 FROM players p WHERE p.deletedAt IS NULL AND p.id>? AND instr(lower(p.name),lower(?))>0
 AND NOT EXISTS(SELECT 1 FROM discord_accounts a WHERE a.playerId=p.id)
 ORDER BY p.id LIMIT 21`,
            )
            .bind(cursor, query)
            .all();
        const rows = players.results.slice(0, 20);
        return json({
            success: true,
            data: {
                players: rows,
                nextCursor: players.results.length > 20 ? rows[rows.length - 1].id : null,
            },
        });
    });
}
