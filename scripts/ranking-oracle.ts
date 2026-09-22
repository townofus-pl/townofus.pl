/**
 * Recomputes the ELO-like ranking from seeded real data and diffs it against the
 * answer already stored in the database.
 *
 * Why this exists: `player_rankings` is the only oracle v2 has. Before any scoring
 * change can be argued about, we need to show we can reproduce today's standings
 * from today's `totalPoints`. Once that holds, re-running after a change turns
 * "this feels harsh" into a number.
 *
 * The formula is deliberately duplicated from `src/app/api/_utils/rankingCalculator.ts`
 * rather than imported — that module needs a Prisma client and a Cloudflare context,
 * neither of which exists offline. The duplication is guarded: a divergence from the
 * stored rows means the two have drifted, which is exactly what this script reports.
 *
 * Usage:
 *   npm run ranking:oracle                    # verify the current season reproduces
 *   npm run ranking:oracle -- --season 2
 *   npm run ranking:oracle -- --json out.json # dump standings, to diff two runs
 */
import { writeFileSync } from 'node:fs';
import { openLocalD1, queryAll } from './lib/localD1';

const W = 9;
const PEN = 5;
const START_RATING = 2000;

/** Scores are floats; anything under this is rounding, not a real divergence. */
const TOLERANCE = 1e-6;

type DisconnectPolicy = 'as-is' | 'floor' | 'zero' | 'exclude';
type Options = { season: number; jsonPath: string | null; verbose: boolean; disconnected: DisconnectPolicy };

type GameRow = { id: number; gameIdentifier: string; startTime: string };
type StatRow = { gameId: number; playerId: number; totalPoints: number; disconnected: number };
type PlayerRow = { id: number; name: string; createdAt: string };
type StoredRow = { gameId: number; playerId: number; score: number };

function parseArgs(argv: string[]): Options {
    const options: Options = { season: 3, jsonPath: null, verbose: false, disconnected: 'as-is' };

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === '--') {
            continue; // tolerated so `tsx script.ts -- --season 2` behaves like the npm form
        } else if (arg === '--season') {
            options.season = Number(argv[(i += 1)]);
            if (!Number.isInteger(options.season)) throw new Error('--season expects an integer');
        } else if (arg === '--json') {
            options.jsonPath = argv[(i += 1)];
            if (!options.jsonPath) throw new Error('--json expects a file path');
        } else if (arg === '--disconnected') {
            const value = argv[(i += 1)] as DisconnectPolicy;
            if (!['as-is', 'floor', 'zero', 'exclude'].includes(value)) {
                throw new Error('--disconnected expects one of: as-is, floor, zero, exclude');
            }
            options.disconnected = value;
        } else if (arg === '--verbose') {
            options.verbose = true;
        } else if (arg === '--help' || arg === '-h') {
            console.log(
                'Usage: npm run ranking:oracle -- [--season N] [--disconnected as-is|floor|zero|exclude]\n' +
                    '                                [--json out.json] [--verbose]',
            );
            process.exit(0);
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }

    return options;
}

function main(): void {
    const options = parseArgs(process.argv.slice(2));
    const db = openLocalD1();

    const games = queryAll<GameRow>(
        db,
        `select id, gameIdentifier, startTime from games
         where deletedAt is null and season = ?
         order by startTime asc, id asc`,
        options.season,
    );

    if (games.length === 0) {
        console.error(`No games found for season ${options.season}.`);
        process.exit(1);
    }

    const players = queryAll<PlayerRow>(db, 'select id, name, createdAt from players where deletedAt is null');
    const nameById = new Map(players.map((p) => [p.id, p.name]));

    // Starting scores: the season_reset rows if this season has them, otherwise
    // every player enters at START_RATING (season 2 predates the reset mechanism).
    const resets = queryAll<{ playerId: number; score: number }>(
        db,
        `select playerId, score from player_rankings
         where deletedAt is null and season = ? and reason = 'season_reset'`,
        options.season,
    );

    const rating = new Map<number, number>();
    for (const reset of resets) rating.set(reset.playerId, reset.score);

    // Without reset rows the season's opening scores were carried in from the season
    // before it, which the seeded data does not contain — so a replay cannot match.
    // Season 2 is the known case: season 1 is deliberately excluded from `SEASONS`.
    const reproducible = resets.length > 0;
    if (!reproducible) {
        console.log(
            `Note: season ${options.season} has no season_reset rows, so its opening scores are\n` +
                '      outside this dataset. Every player is assumed to start at START_RATING and\n' +
                '      a divergence below is expected, not a defect.\n',
        );
    }

    // A player joins the universe once they exist. The live calculator queries all
    // non-deleted players at call time, so a player created mid-season is absent for
    // games before them and present in the roster from then on.
    const joinsAt = new Map(players.map((p) => [p.id, Date.parse(p.createdAt)]));

    const statsByGame = new Map<number, StatRow[]>();
    for (const stat of queryAll<StatRow>(
        db,
        'select gameId, playerId, totalPoints, disconnected from game_player_statistics',
    )) {
        const bucket = statsByGame.get(stat.gameId);
        if (bucket) bucket.push(stat);
        else statsByGame.set(stat.gameId, [stat]);
    }

    const storedByGame = new Map<number, Map<number, number>>();
    for (const row of queryAll<StoredRow>(
        db,
        `select gameId, playerId, score from player_rankings
         where deletedAt is null and season = ? and gameId is not null
         order by id asc`,
        options.season,
    )) {
        let bucket = storedByGame.get(row.gameId);
        if (!bucket) storedByGame.set(row.gameId, (bucket = new Map()));
        bucket.set(row.playerId, row.score); // later rows win, mirroring MAX(id)
    }

    let firstDivergence: string | null = null;
    let worstPerGame = 0;
    let comparedRows = 0;

    for (const game of games) {
        const gameStart = Date.parse(game.startTime);
        const stats = statsByGame.get(game.id) ?? [];

        // `--disconnected` rewrites what a leaver scored, so the two candidate rules can be
        // measured against the standings they would actually have produced:
        //   as-is  what the database holds (v1 zeroed every leaver)
        //   floor  the mod's v2 clamp — min(own, lowest total among those who stayed)
        //   zero   v1's rule, applied explicitly
        //   exclude  a leaver is not "present" at all — they fall into the absent branch, so the
        //            game costs them the flat absence penalty instead of W * (0 - expected)
        // `own` is unrecoverable from v1 rows (they were already zeroed), so `floor` uses the
        // floor itself, which is the clamp's upper bound and therefore its most generous case.
        const stayedFloor = stats.some((s) => s.disconnected)
            ? Math.min(...stats.filter((s) => !s.disconnected).map((s) => s.totalPoints ?? 0))
            : 0;

        const scoreOf = (s: StatRow): number => {
            if (!s.disconnected || options.disconnected === 'as-is') return s.totalPoints ?? 0;
            if (options.disconnected === 'zero') return 0;
            return Math.min(s.totalPoints ?? 0, stayedFloor);
        };

        const pointsByPlayer = new Map(stats.map((s) => [s.playerId, scoreOf(s)]));

        const universe = players.filter((p) => (joinsAt.get(p.id) ?? 0) <= gameStart || rating.has(p.id));
        const ratingOf = (id: number) => rating.get(id) ?? START_RATING;

        const leftEarly = new Set(stats.filter((s) => s.disconnected).map((s) => s.playerId));
        const counts = (id: number) =>
            pointsByPlayer.has(id) && !(options.disconnected === 'exclude' && leftEarly.has(id));

        const present = universe.filter((p) => counts(p.id));
        const absent = universe.filter((p) => !counts(p.id));

        const sumP = present.reduce((acc, p) => acc + (pointsByPlayer.get(p.id) ?? 0), 0);
        const sumR = present.reduce((acc, p) => acc + ratingOf(p.id), 0);
        const absentCount = absent.filter((p) => ratingOf(p.id) > START_RATING).length;

        if (sumR === 0) continue; // the live calculator throws here; nothing to compare

        const next = new Map<number, number>();

        for (const player of present) {
            const previous = ratingOf(player.id);
            const share = previous / sumR;
            const expected = sumP * share;
            const bonus = PEN * absentCount * share;
            next.set(player.id, previous + W * ((pointsByPlayer.get(player.id) ?? 0) - expected) + bonus);
        }

        for (const player of absent) {
            const previous = ratingOf(player.id);
            next.set(player.id, previous - (previous > START_RATING ? PEN : 0));
        }

        const stored = storedByGame.get(game.id);
        if (stored) {
            for (const [playerId, score] of next) {
                const actual = stored.get(playerId);
                if (actual === undefined) continue;
                comparedRows += 1;
                const delta = Math.abs(actual - score);
                if (delta > worstPerGame) worstPerGame = delta;
                if (delta > TOLERANCE && firstDivergence === null) {
                    firstDivergence =
                        `${game.gameIdentifier} · ${nameById.get(playerId) ?? playerId} · ` +
                        `stored ${actual.toFixed(4)} vs computed ${score.toFixed(4)} (Δ ${delta.toFixed(4)})`;
                }
            }
        }

        for (const [playerId, score] of next) rating.set(playerId, score);
    }

    const standings = [...rating.entries()]
        .map(([id, score]) => ({ player: nameById.get(id) ?? String(id), computed: score }))
        .sort((a, b) => b.computed - a.computed);

    // Final check against the terminal ranking row **within the replayed season**.
    //
    // Deliberately not `players.currentRankingId`: that column is season-agnostic and points at
    // the player's latest row overall. The moment a new season is reset it points at the new
    // season's 2000-point row, and replaying any earlier season would report a false failure —
    // which is exactly when this tool is most needed. For the current season the two are the
    // same row.
    const current = new Map(
        queryAll<{ name: string; score: number }>(
            db,
            `select p.name, r.score
             from players p
             join player_rankings r on r.id = (
               select max(id) from player_rankings
               where playerId = p.id and season = ? and deletedAt is null
             )
             where p.deletedAt is null and r.deletedAt is null`,
            options.season,
        ).map((row) => [row.name, row.score]),
    );

    let worstFinal = 0;
    let worstFinalPlayer = '';
    for (const entry of standings) {
        const actual = current.get(entry.player);
        if (actual === undefined) continue;
        const delta = Math.abs(actual - entry.computed);
        if (delta > worstFinal) {
            worstFinal = delta;
            worstFinalPlayer = entry.player;
        }
    }

    console.log(`Season ${options.season} · ${games.length} games · ${comparedRows} ranking rows compared\n`);

    if (options.verbose) {
        for (const entry of standings.slice(0, 15)) {
            const actual = current.get(entry.player);
            console.log(
                `  ${entry.player.padEnd(20)} ${entry.computed.toFixed(2).padStart(10)}` +
                    (actual === undefined ? '' : `   (stored ${actual.toFixed(2)})`),
            );
        }
        console.log('');
    }

    if (options.jsonPath) {
        writeFileSync(options.jsonPath, `${JSON.stringify(standings, null, 2)}\n`);
        console.log(`Standings written to ${options.jsonPath}`);
    }

    if (options.disconnected !== 'as-is') {
        console.log(`Disconnect policy: ${options.disconnected} (what-if — divergence below is the effect)`);
        console.log(`  largest standings shift: ${worstFinal.toFixed(2)} rating (${worstFinalPlayer})\n`);
        db.close();
        return;
    }

    const reproduced = worstPerGame <= TOLERANCE && worstFinal <= TOLERANCE;

    if (!reproducible) {
        console.log('SKIP  no baseline to reproduce — see the note above');
        console.log(`      worst final delta vs stored: ${worstFinal.toFixed(2)} (${worstFinalPlayer})`);
        db.close();
        return;
    }

    if (reproduced) {
        console.log('PASS  replay reproduces the stored rankings exactly');
    } else {
        console.log(`FAIL  replay diverges from the stored rankings`);
        console.log(`      worst per-game delta:  ${worstPerGame.toFixed(6)}`);
        console.log(`      worst final delta:     ${worstFinal.toFixed(6)}  (${worstFinalPlayer})`);
        if (firstDivergence) console.log(`      first divergence:      ${firstDivergence}`);
    }

    db.close();

    if (!reproduced) process.exit(1);
}

main();
