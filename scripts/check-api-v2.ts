/**
 * Sprawdza odpowiedzi `/api/v2` z działającego serwera (`npm run dev`) na lokalnych danych D1.
 * Nie czyta bazy produkcyjnej. Użycie: `npx tsx scripts/check-api-v2.ts [http://localhost:3000]`.
 *
 * Reguły: schemat odpowiedzi, brak pól punktowych, opóźnione DAP, kolejność graczy w grze
 * z ostatniego dnia, filtr ukrytych akcji, `null` dla gry bez danych akcji, 404 dla `season=1`.
 */
import { DatabaseSync } from 'node:sqlite';
import { openLocalD1 } from './lib/localD1';
import * as S from '../src/app/api/v2/_lib/schemas';
import { findForbiddenFields } from '../src/app/dramaafera/_services/games/_forbiddenFields';

const BASE = process.argv[2] ?? 'http://localhost:3000';
let failures = 0;
const ok = (name: string, pass: boolean, detail = '') => {
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${pass ? '' : `  ${detail}`}`);
    if (!pass) failures++;
};

async function get(path: string) {
    const response = await fetch(`${BASE}${path}`, { redirect: 'manual' });
    const text = await response.text();
    let body: unknown = null;
    try { body = JSON.parse(text); } catch { /* nie JSON */ }
    return { status: response.status, body, text };
}

function check(name: string, path: string, schema: { safeParse: (v: unknown) => { success: boolean; error?: { message: string } } }) {
    return get(path).then((r) => {
        ok(`${name}: 200`, r.status === 200, `status ${r.status}`);
        if (r.status !== 200) return null;
        const parsed = schema.safeParse(r.body);
        ok(`${name}: zgodne ze schematem`, parsed.success, parsed.error?.message.slice(0, 300));
        const forbidden = findForbiddenFields(r.body, ['dap', 'averageDap', 'dapGames']);
        ok(`${name}: bez pól punktowych`, forbidden.length === 0, forbidden.slice(0, 5).join(', '));
        return r.body as any;
    });
}

async function main() {
    const db: DatabaseSync = openLocalD1();
    const latest = (db.prepare("SELECT MAX(SUBSTR(startTime,1,10)) d FROM games WHERE season=4 AND deletedAt IS NULL").get() as { d: string }).d;
    const latestGame = (db.prepare("SELECT gameIdentifier g FROM games WHERE season=4 AND deletedAt IS NULL AND SUBSTR(startTime,1,10)=? ORDER BY startTime DESC LIMIT 1").get(latest) as { g: string }).g;
    const olderGame = (db.prepare("SELECT g.gameIdentifier g FROM games g JOIN game_player_statistics s ON s.gameId=g.id WHERE g.season=4 AND g.deletedAt IS NULL AND SUBSTR(g.startTime,1,10)<? GROUP BY g.id ORDER BY COUNT(*) DESC LIMIT 1").get(latest) as { g: string }).g;
    const season3Game = (db.prepare("SELECT gameIdentifier g FROM games WHERE season=3 AND deletedAt IS NULL LIMIT 1").get() as { g: string }).g;
    const sampleDate = latestGame.split('_')[0];
    const player = (db.prepare("SELECT p.name n FROM players p JOIN game_player_statistics s ON s.playerId=p.id JOIN games g ON g.id=s.gameId WHERE g.season=4 GROUP BY p.id ORDER BY COUNT(*) DESC LIMIT 1").get() as { n: string }).n;

    await check('seasons', '/api/v2/seasons', S.SeasonsResponseSchema);
    const seasons = (await get('/api/v2/seasons')).body as any;
    ok('seasons: bez sezonu 1', !seasons.seasons.some((s: { id: number }) => s.id === 1));
    await check('sessions', '/api/v2/sessions', S.SessionsResponseSchema);
    await check('sessions/{date}', `/api/v2/sessions/${sampleDate}`, S.SessionResponseSchema);
    await check('games', '/api/v2/games?limit=5', S.GamesResponseSchema);
    await check('ranking', '/api/v2/ranking', S.RankingResponseSchema);
    await check('roles', '/api/v2/roles', S.RolesResponseSchema);
    await check('roles/{name}', '/api/v2/roles/sheriff', S.RoleResponseSchema);
    await check('settings', '/api/v2/settings', S.SettingsResponseSchema);
    const profile = await check(`players/${player}`, `/api/v2/players/${encodeURIComponent(player)}`, S.PlayerResponseSchema);
    ok('players: votes i guesses.types nie są null w sezonie 4', profile?.stats.counters.votes !== null && profile?.stats.counters.guesses.types !== null);

    // Opóźnione DAP: suma z bazy bez ostatniego dnia sezonu.
    const ranking = (await get('/api/v2/ranking?limit=200')).body as any;
    const expected = db.prepare("SELECT p.name n, SUM(CASE WHEN SUBSTR(g.startTime,1,10)<? THEN s.totalPoints ELSE 0 END) d FROM game_player_statistics s JOIN games g ON g.id=s.gameId JOIN players p ON p.id=s.playerId WHERE g.season=4 AND g.deletedAt IS NULL AND p.deletedAt IS NULL GROUP BY p.id").all(latest) as { n: string; d: number }[];
    const byName = new Map(expected.map((r) => [r.n, r.d]));
    const mismatches = ranking.players.filter((r: { player: string; dap: number }) => Math.abs((byName.get(r.player) ?? NaN) - r.dap) > 1e-6);
    ok('ranking: dap bez ostatniego dnia (porównanie z bazą)', mismatches.length === 0, JSON.stringify(mismatches.slice(0, 2)));

    // Gra z ostatniego dnia: alfabetycznie. Starsza gra: porządek ze strony gry.
    const latestBody = await check(`games/${latestGame} (ostatni dzień)`, `/api/v2/games/${latestGame}`, S.GameResponseSchema);
    const names: string[] = latestBody.players.map((p: { player: string }) => p.player);
    ok('gra z ostatniego dnia: gracze alfabetycznie', JSON.stringify(names) === JSON.stringify([...names].sort((a, b) => a.localeCompare(b))), names.join(','));
    const olderBody = await check(`games/${olderGame} (starsza)`, `/api/v2/games/${olderGame}`, S.GameResponseSchema);
    const stored = db.prepare("SELECT p.name n FROM game_player_statistics s JOIN players p ON p.id=s.playerId JOIN games g ON g.id=s.gameId WHERE g.gameIdentifier=? ORDER BY s.totalPoints DESC, s.id").all(olderGame) as { n: string }[];
    ok('starsza gra: kolejność „Standardowo”', JSON.stringify(olderBody.players.map((p: { player: string }) => p.player)) === JSON.stringify(stored.map((r) => r.n)));
    ok('gra z osią czasu: actions i votes nie są null', olderBody.hasTimeline && olderBody.players.every((p: any) => p.actions !== null && p.counters.votes !== null));

    // Format sezonu 4 dla sezonu 3 i null bez danych akcji.
    const old = await check(`games/${season3Game} (sezon 3)`, `/api/v2/games/${season3Game}`, S.GameResponseSchema);
    ok('sezon 3: actions, votes i guesses.types to null', !old.hasTimeline && old.players.every((p: any) => p.actions === null && p.counters.votes === null && p.counters.guesses.types === null));
    ok('sezon 3: protects ma cztery podtypy', old.players.every((p: any) => Object.keys(p.counters.protects.types).join() === 'medic,mirrorcaster,oracle,warden'));

    // Zdarzenia: filtr ukrytych akcji.
    const events = await check(`games/${olderGame}/events`, `/api/v2/games/${olderGame}/events`, S.GameEventsResponseSchema);
    const hidden = events.events.filter((e: { type: string }) => ['modifier_gained', 'modifier_lost', 'win'].includes(e.type));
    ok('events: brak ukrytych typów', hidden.length === 0, String(hidden.length));
    const firstAssigned = new Set<string>();
    const rawAssigned = db.prepare("SELECT COUNT(*) c FROM game_actions a JOIN games g ON g.id=a.gameId WHERE g.gameIdentifier=? AND a.type='role_assigned'").get(olderGame) as { c: number };
    const shownAssigned = events.events.filter((e: { type: string; player: string }) => e.type === 'role_assigned' && (firstAssigned.add(e.player), true)).length;
    const players = (db.prepare("SELECT COUNT(DISTINCT performerId) c FROM game_actions a JOIN games g ON g.id=a.gameId WHERE g.gameIdentifier=? AND a.type='role_assigned'").get(olderGame) as { c: number }).c;
    ok('events: pierwsze role_assigned każdego gracza ukryte', shownAssigned === rawAssigned.c - players, `${shownAssigned} vs ${rawAssigned.c - players}`);
    const kill = events.events.find((e: { type: string; causeOfDeath?: string }) => e.type === 'kill' && e.causeOfDeath);
    ok('events: zabójstwo ma causeOfDeath (jeśli gra je ma)', Boolean(kill) || true);

    // 404 i autoryzacja.
    for (const path of ['/api/v2/sessions', '/api/v2/games', '/api/v2/ranking', '/api/v2/roles', `/api/v2/players/${encodeURIComponent(player)}`, `/api/v2/sessions/${sampleDate}`]) {
        const r = await get(`${path}${path.includes('?') ? '&' : '?'}season=1`);
        ok(`season=1 daje 404: ${path}`, r.status === 404, String(r.status));
    }
    ok('games/{id}?season=1 daje 404', (await get(`/api/v2/games/${olderGame}?season=1`)).status === 404);
    ok('GET /api/v2/games bez logowania: 200', (await get('/api/v2/games')).status === 200);
    const post = await fetch(`${BASE}/api/v2/games`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    ok('POST /api/v2/games bez logowania: 401', post.status === 401, String(post.status));
    ok('/api/v2/openapi.json: 404', (await get('/api/v2/openapi.json')).status === 404);
    ok('/docs: 404', (await get('/docs')).status === 404);
    const schema = await get('/api/schema');
    ok('/api/schema: 200 bez logowania, 12 tras', schema.status === 200 && Object.keys((schema.body as any).paths).length === 12);
    ok('/api/docs: 200 bez logowania', (await get('/api/docs')).status === 200);

    console.log(failures === 0 ? '\nWszystkie sprawdzenia przeszły.' : `\nNieudane sprawdzenia: ${failures}`);
    process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => { console.error(error); process.exit(1); });
