/**
 * Jednorazowa korekta `games.winnerTeam` / `games.winCondition` dla gier
 * zaimportowanych zanim `createGame.ts` zaczął używać `determineTeam()`.
 *
 * Stara logika wyznaczała drużynę z dwóch zaszytych list obejmujących 12 z 55
 * ról, klasyfikowała `glitch` jako impostora i czytała rolę POCZĄTKOWĄ — przez
 * co wygrane m.in. Warlocka, Werewolfa i Vampira zapisywały się jako
 * "Crewmate". Nowe gry są już poprawne; ten skrypt naprawia historię.
 *
 * Uruchamiany ręcznie, osobno dla każdego środowiska. Domyślnie tylko generuje
 * SQL do przejrzenia — bez `--apply` nic nie trafia do bazy:
 *   npx tsx scripts/backfill-winner-team.ts --local
 *   npx tsx scripts/backfill-winner-team.ts --preview
 *   npx tsx scripts/backfill-winner-team.ts --remote
 *
 * Zapis dopiero po dorzuceniu `--apply`:
 *   npx tsx scripts/backfill-winner-team.ts --remote --apply
 *
 * Idempotentny — ponowne uruchomienie po aplikacji zgłosi 0 UPDATE-ów.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { determineTeam } from '../src/app/dramaafera/_utils/gameUtils';
import { Teams } from '../src/constants/teams';

const DATABASE_NAME = 'townofus-pl';
const OUTPUT_FILE = 'db-backups/backfill-winner-team.sql';

type WinnerRow = {
    gameIdentifier: string;
    winnerTeam: string | null;
    winCondition: string | null;
    playerName: string;
    finalRole: string;
};

// Zwycięzcy każdej gry wraz z ich rolą KOŃCOWĄ (najwyższy `order` w player_roles).
const QUERY = `
SELECT g.gameIdentifier, g.winnerTeam, g.winCondition, p.name AS playerName,
       (SELECT roleName FROM player_roles
         WHERE gamePlayerStatisticsId = s.id
         ORDER BY "order" DESC LIMIT 1) AS finalRole
FROM game_player_statistics s
JOIN games g ON g.id = s.gameId
JOIN players p ON p.id = s.playerId
WHERE g.deletedAt IS NULL AND s.win = 1
`.replace(/\s+/g, ' ').trim();

type Target = { flags: string[]; label: string };

const TARGETS: Record<string, Target> = {
    local: { flags: ['--local'], label: 'local' },
    preview: { flags: ['--remote', '--preview'], label: 'preview' },
    remote: { flags: ['--remote'], label: 'produkcja' },
};

function runWrangler(target: Target, extra: string[]): string {
    const result = spawnSync('npx', ['wrangler', 'd1', 'execute', DATABASE_NAME, ...target.flags, ...extra], {
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024,
    });

    if (result.status !== 0) {
        process.stderr.write(result.stderr ?? '');
        throw new Error(`wrangler d1 execute zakończył się kodem ${result.status}`);
    }

    return result.stdout;
}

function fetchWinners(target: Target): WinnerRow[] {
    const stdout = runWrangler(target, ['--json', '--command', QUERY]);
    // wrangler potrafi dopisać ostrzeżenia przed JSON-em — bierzemy od pierwszego `[`.
    return JSON.parse(stdout.slice(stdout.indexOf('[')))[0].results as WinnerRow[];
}

/**
 * Priorytet Impostor > Crewmate > Neutral — ta sama kolejność co
 * `calculateWinnerFromStats`, dzięki czemu API i UI dają ten sam wynik.
 */
function resolveWinner(winners: WinnerRow[]): { team: string; condition: string } {
    const teams = winners.map((w) => determineTeam(w.finalRole));

    const team = teams.includes(Teams.Impostor)
        ? Teams.Impostor
        : teams.includes(Teams.Crewmate)
            ? Teams.Crewmate
            : Teams.Neutral;

    // Przy jednym zwycięzcy podajemy jego rolę — tak jak robi to `createGame.ts`.
    const condition = winners.length === 1 ? `${winners[0].finalRole} victory` : `${team} victory`;

    return { team, condition };
}

const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;

async function main(): Promise<void> {
    const key = Object.keys(TARGETS).find((name) => process.argv.includes(`--${name}`));
    if (!key) {
        throw new Error('Podaj środowisko: --local, --preview albo --remote (opcjonalnie --apply).');
    }
    const target = TARGETS[key];
    const apply = process.argv.includes('--apply');

    console.log(`Czytam zwycięzców z bazy (${target.label})...`);
    const rows = fetchWinners(target);

    const byGame = new Map<string, WinnerRow[]>();
    for (const row of rows) {
        const list = byGame.get(row.gameIdentifier);
        if (list) list.push(row);
        else byGame.set(row.gameIdentifier, [row]);
    }

    const updates: string[] = [];
    for (const [gameIdentifier, winners] of byGame) {
        const { team, condition } = resolveWinner(winners);
        if (winners[0].winnerTeam === team && winners[0].winCondition === condition) continue;

        updates.push(
            `UPDATE games SET winnerTeam = ${quote(team)}, winCondition = ${quote(condition)}` +
            ` WHERE gameIdentifier = ${quote(gameIdentifier)};`,
        );
    }

    console.log(`Gier ze zwycięzcą: ${byGame.size}. Do poprawy: ${updates.length}.`);

    if (updates.length === 0) {
        console.log('Nic do zrobienia — dane są już spójne.');
        return;
    }

    // Bez BEGIN TRANSACTION / COMMIT — zdalne D1 odrzuca je z błędem
    // "please use the state.storage.transaction() ... APIs instead", nawet jeśli
    // miniflare lokalnie je przepuszcza. Skutek: przerwanie w połowie zostawia
    // częściowo naniesioną korektę. Nie szkodzi — każdy UPDATE adresuje wiersz
    // po gameIdentifier, a skrypt jest idempotentny, więc wystarczy uruchomić
    // go ponownie, żeby dokończyć resztę.
    await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
    await writeFile(OUTPUT_FILE, [...updates, ''].join('\n'), 'utf8');
    console.log(`Zapisano ${OUTPUT_FILE}.`);

    if (!apply) {
        console.log(`\nTo był podgląd — nic nie zapisano do bazy. Aby zastosować:`);
        console.log(`  npx tsx scripts/backfill-winner-team.ts --${key} --apply`);
        return;
    }

    console.log(`\nStosuję ${updates.length} UPDATE-ów na: ${target.label}...`);
    runWrangler(target, ['--file', OUTPUT_FILE]);
    console.log('Gotowe.');
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
