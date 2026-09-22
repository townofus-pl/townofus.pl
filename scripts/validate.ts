/**
 * Sanity-checks the seeded local D1 database.
 *
 * Every check is a loose floor or a zero-tolerance integrity query, never an exact
 * count — real data drifts and an exact assertion would red the build every week.
 * Read the actual totals from this tool's output, not from any document.
 *
 * Usage:
 *   npm run validate                        # local D1
 *   npm run validate -- --target staging    # against the deployed staging database
 */
import { makeRunner, parseTarget, describeTarget, type Runner } from './lib/d1Runner';

type Check = { name: string; run: () => string | null }; // null = pass, string = failure reason

const START_RATING = 2000;

function main(): void {
    const argv = process.argv.slice(2);
    const targetFlag = argv.includes('--target') ? argv[argv.indexOf('--target') + 1] : undefined;
    const target = parseTarget(targetFlag);
    const run: Runner = makeRunner(target);

    console.log(`Validating ${describeTarget(target)}\n`);

    const count = (sql: string): number => Number((run(sql)[0] as { c?: number })?.c ?? 0);
    const queryAll = (sql: string) => run(sql);
    const queryOne = (sql: string) => run(sql)[0];

    const floor = (name: string, sql: string, min: number): Check => ({
        name,
        run: () => {
            const n = count(sql);
            return n >= min ? null : `got ${n}, expected at least ${min}`;
        },
    });

    /** Zero-tolerance: the query must return no rows. */
    const empty = (name: string, sql: string): Check => ({
        name,
        run: () => {
            const rows = queryAll(sql);
            if (rows.length === 0) return null;
            const sample = JSON.stringify(rows[0]);
            return `${rows.length} offending row(s), e.g. ${sample}`;
        },
    });

    const checks: Check[] = [
        floor('games seeded', 'select count(*) c from games where deletedAt is null', 500),
        floor('players seeded', 'select count(*) c from players where deletedAt is null', 40),
        floor('player stats seeded', 'select count(*) c from game_player_statistics', 5000),
        floor('rankings seeded', 'select count(*) c from player_rankings where deletedAt is null', 20000),
        floor('meetings seeded', 'select count(*) c from meetings where deletedAt is null', 1000),

        floor(
            'scoring is not uniformly zero',
            'select count(*) c from game_player_statistics where totalPoints <> 0',
            1000,
        ),
        floor(
            'at least two winning teams present',
            'select count(distinct winnerTeam) c from games where deletedAt is null and winnerTeam is not null',
            2,
        ),
        floor('more than one season present', 'select count(distinct season) c from games where deletedAt is null', 2),

        empty(
            'no game without player stats',
            `select g.id, g.gameIdentifier from games g
             where g.deletedAt is null
               and not exists (select 1 from game_player_statistics s where s.gameId = g.id)`,
        ),
        empty(
            'no duplicate gameIdentifier',
            `select gameIdentifier, count(*) n from games where deletedAt is null
             group by gameIdentifier having n > 1`,
        ),
        empty(
            'no orphan game_player_statistics',
            `select s.id from game_player_statistics s
             where not exists (select 1 from games g where g.id = s.gameId)
                or not exists (select 1 from players p where p.id = s.playerId)`,
        ),
        empty(
            'no orphan player_rankings',
            `select r.id from player_rankings r
             where not exists (select 1 from players p where p.id = r.playerId)
                or (r.gameId is not null and not exists (select 1 from games g where g.id = r.gameId))`,
        ),
        empty(
            'no orphan player_roles',
            `select pr.id from player_roles pr
             where not exists (select 1 from game_player_statistics s where s.id = pr.gamePlayerStatisticsId)`,
        ),
        empty(
            'no orphan meeting_votes',
            `select v.id from meeting_votes v
             where not exists (select 1 from meetings m where m.id = v.meetingId)
                or not exists (select 1 from players p where p.id = v.voterId)
                or not exists (select 1 from players p where p.id = v.targetId)`,
        ),
        empty(
            'no orphan game_actions',
            `select a.id from game_actions a
             where not exists (select 1 from games g where g.id = a.gameId)
                or not exists (select 1 from players p where p.id = a.performerId)
                or (a.targetId is not null and not exists (select 1 from players p where p.id = a.targetId))`,
        ),
        empty(
            'currentRankingId points at a live ranking row',
            `select p.id, p.name from players p
             where p.deletedAt is null and p.currentRankingId is not null
               and not exists (
                 select 1 from player_rankings r
                 where r.id = p.currentRankingId and r.playerId = p.id and r.deletedAt is null
               )`,
        ),
        empty(
            'no ranked player left without a score',
            `select p.id, p.name from players p
             where p.deletedAt is null and p.currentRankingId is null
               and exists (select 1 from player_rankings r where r.playerId = p.id and r.deletedAt is null)`,
        ),
        empty(
            'no game missing its core metadata',
            `select id, gameIdentifier from games
             where deletedAt is null and (startTime is null or endTime is null or map is null or season is null)`,
        ),
        empty(
            'ranking scores are finite and plausible',
            `select id, playerId, score from player_rankings
             where deletedAt is null and (score is null or score < 0 or score > ${START_RATING * 5})`,
        ),
    ];

    let failed = 0;
    for (const check of checks) {
        let reason: string | null;
        try {
            reason = check.run();
        } catch (err) {
            reason = `threw: ${(err as Error).message}`;
        }

        if (reason === null) {
            console.log(`PASS  ${check.name}`);
        } else {
            failed += 1;
            console.log(`FAIL  ${check.name} — ${reason}`);
        }
    }

    const totals = queryOne(
        `select (select count(*) from games where deletedAt is null) games,
                (select count(*) from players where deletedAt is null) players,
                (select count(*) from player_rankings where deletedAt is null) rankings,
                (select max(startTime) from games where deletedAt is null) latest`,
    );

    console.log(
        `\n${checks.length - failed}/${checks.length} passed · ` +
            `${totals?.games} games · ${totals?.players} players · ${totals?.rankings} rankings · ` +
            `newest game ${String(totals?.latest ?? '?').slice(0, 10)}`,
    );

    if (failed > 0) process.exit(1);
}

main();
