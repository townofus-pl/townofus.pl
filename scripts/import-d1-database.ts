import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

type ParsedOptions = {
    databaseName: string;
    exportFile: string;
    stateDir: string;
    dryRun: boolean;
    exportRemote: boolean;
    importFile: string;
    restoreFile: string;
};

type RankingReference = {
    playerId: number;
    currentRankingId: number | null;
};

const DEFAULT_DATABASE_NAME = 'townofus-pl';
const DEFAULT_EXPORT_FILE = 'db-backups/townofus-pl-remote.sql';
const DEFAULT_STATE_DIR = '.wrangler/state/v3/d1';
const TEMP_DIR = '.wrangler/tmp/import-d1';
const TEMP_IMPORT_FILE = path.join(TEMP_DIR, 'clean-import.sql');
const TEMP_RESTORE_FILE = path.join(TEMP_DIR, 'restore-player-current-ranking.sql');

const TABLE_ORDER = [
    'players',
    'games',
    'lista_cweli',
    'meetings',
    'player_rankings',
    'game_player_statistics',
    'player_roles',
    'player_modifiers',
    'game_events',
    'meeting_votes',
    'meeting_skip_votes',
    'meeting_jailed_players',
    'meeting_blackmailed_players',
    'meeting_no_votes',
    'sqlite_sequence',
];

function parseArgs(argv: string[]): ParsedOptions {
    const options: ParsedOptions = {
        databaseName: DEFAULT_DATABASE_NAME,
        exportFile: DEFAULT_EXPORT_FILE,
        stateDir: DEFAULT_STATE_DIR,
        dryRun: false,
        exportRemote: true,
        importFile: TEMP_IMPORT_FILE,
        restoreFile: TEMP_RESTORE_FILE,
    };

    if (process.env.npm_config_dry_run === 'true') {
        options.dryRun = true;
    }

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];

        if (argument === '--help' || argument === '-h') {
            printHelp();
            process.exit(0);
        }

        if (argument === '--dry-run') {
            options.dryRun = true;
            continue;
        }

        if (argument === '--no-export') {
            options.exportRemote = false;
            continue;
        }

        const nextValue = argv[index + 1];

        if (argument === '--database' && nextValue) {
            options.databaseName = nextValue;
            index += 1;
            continue;
        }

        if (argument === '--export-file' && nextValue) {
            options.exportFile = nextValue;
            index += 1;
            continue;
        }

        if (argument === '--state-dir' && nextValue) {
            options.stateDir = nextValue;
            index += 1;
            continue;
        }

        if (argument === '--import-file' && nextValue) {
            options.importFile = nextValue;
            index += 1;
            continue;
        }

        if (argument === '--restore-file' && nextValue) {
            options.restoreFile = nextValue;
            index += 1;
            continue;
        }

        throw new Error(`Nieznany argument: ${argument}`);
    }

    return options;
}

function printHelp(): void {
    process.stdout.write([
        'Import bezpiecznej kopii lokalnej D1 z exportu Cloudflare.',
        '',
        'Użycie:',
        '  npm run db:import:local -- [opcje]',
        '',
        'Opcje:',
        '  --dry-run              Pokaż plan bez uruchamiania wrangler',
        '  --no-export            Pomiń ponowny export z Cloudflare',
        '  --database <nazwa>     Domyślnie: townofus-pl',
        '  --export-file <ścieżka> Domyślnie: db-backups/townofus-pl-remote.sql',
        '  --state-dir <ścieżka>   Domyślnie: .wrangler/state/v3/d1',
        '  --import-file <ścieżka> Plik tymczasowy z INSERT-ami',
        '  --restore-file <ścieżka> Plik tymczasowy z UPDATE-ami',
        '',
        'Skrypt:',
        '  1. eksportuje bazę z Cloudflare',
        '  2. czyści dump do samych INSERT-ów',
        '  3. nulluje players.currentRankingId na czas importu',
        '  4. pomija INSERT INTO "d1_migrations"',
        '  5. aplikuje migracje do świeżego stanu',
        '  6. importuje dane i odtwarza currentRankingId',
        '  7. uruchamia foreign_key_check i podstawowe kontrole',
        '',
    ].join('\n'));
}

function runCommand(command: string, args: string[], input?: string): void {
    const result = spawnSync(command, args, {
        encoding: 'utf8',
        input,
        maxBuffer: 50 * 1024 * 1024,
    });

    if (result.stdout) {
        process.stdout.write(result.stdout);
    }

    if (result.stderr) {
        process.stderr.write(result.stderr);
    }

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(`Polecenie zakończyło się kodem ${result.status ?? 'nieznanym'}: ${command} ${args.join(' ')}`);
    }
}

function getWranglerCommand(): string {
    return 'wrangler';
}

function extractInsertStatements(rawSql: string): string[] {
    return rawSql.match(/INSERT INTO[\s\S]*?;/g) ?? [];
}

function extractTableName(statement: string): string | null {
    const match = statement.match(/^INSERT INTO "([^"]+)"/);
    return match ? match[1] : null;
}

function parsePlayerReference(statement: string): RankingReference {
    const match = statement.match(
        /^INSERT INTO "players" \("id","name","createdAt","updatedAt","currentRankingId","deletedAt"\) VALUES\((\d+),.+?,.+?,.+?,(NULL|\d+),.+\);$/,
    );

    if (!match) {
        throw new Error(`Nie udało się sparsować INSERT-a players: ${statement.slice(0, 200)}...`);
    }

    return {
        playerId: Number.parseInt(match[1], 10),
        currentRankingId: match[2] === 'NULL' ? null : Number.parseInt(match[2], 10),
    };
}

function nullifyPlayerRanking(statement: string): string {
    const rewritten = statement.replace(
        /^(INSERT INTO "players" \("id","name","createdAt","updatedAt","currentRankingId","deletedAt"\) VALUES\(\d+,.+?,.+?,.+?,)(NULL|\d+)(,.+\);)$/, 
        '$1NULL$3',
    );

    if (rewritten === statement) {
        throw new Error(`Nie udało się wyzerować currentRankingId w INSERT players: ${statement.slice(0, 200)}...`);
    }

    return rewritten;
}

function buildPreparedData(insertStatements: string[]): { importStatements: string[]; restoreStatements: string[] } {
    const groupedStatements = new Map<string, string[]>();
    const restoreStatements: string[] = [];

    for (const statement of insertStatements) {
        const tableName = extractTableName(statement);

        if (!tableName) {
            continue;
        }

        if (tableName === 'd1_migrations') {
            continue;
        }

        if (tableName === 'players') {
            const reference = parsePlayerReference(statement);
            const currentRankingValue = reference.currentRankingId === null ? 'NULL' : reference.currentRankingId.toString();
            restoreStatements.push(
                `UPDATE "players" SET "currentRankingId" = ${currentRankingValue} WHERE "id" = ${reference.playerId};`,
            );
        }

        const normalizedStatement = tableName === 'players' ? nullifyPlayerRanking(statement) : statement;

        const currentGroup = groupedStatements.get(tableName) ?? [];
        currentGroup.push(normalizedStatement);
        groupedStatements.set(tableName, currentGroup);
    }

    const importStatements: string[] = [];

    for (const tableName of TABLE_ORDER) {
        const tableStatements = groupedStatements.get(tableName);
        if (tableStatements) {
            importStatements.push(...tableStatements);
            groupedStatements.delete(tableName);
        }
    }

    const remainingTables = [...groupedStatements.keys()].sort();
    for (const tableName of remainingTables) {
        importStatements.push(...(groupedStatements.get(tableName) ?? []));
    }

    return { importStatements, restoreStatements };
}

async function ensureFreshDirectory(directoryPath: string): Promise<void> {
    await rm(directoryPath, { force: true, recursive: true });
    await mkdir(path.dirname(directoryPath), { recursive: true });
}

async function main(): Promise<void> {
    const options = parseArgs(process.argv.slice(2));
    const wranglerCommand = getWranglerCommand();

    // Wrangler appends 'v3/d1/' internally to --persist-to, so we must pass the
    // grandparent of stateDir (.wrangler/state) to land at the correct default path.
    const persistToDir = path.resolve(options.stateDir, '../..');

    console.log(`Baza: ${options.databaseName}`);
    console.log(`Export: ${options.exportFile}`);
    console.log(`Stan lokalny: ${options.stateDir}`);
    console.log(`Persist-to: ${persistToDir}`);

    if (options.dryRun) {
        console.log('Tryb testowy: nie uruchamiam wrangler i nie zapisuję zmian.');
        return;
    }

    if (options.exportRemote) {
        console.log('Eksportuję bazę z Cloudflare...');
        runCommand(wranglerCommand, ['d1', 'export', options.databaseName, '--remote', '--output', options.exportFile]);
    }

    console.log('Czyścię lokalny stan D1...');
    await ensureFreshDirectory(options.stateDir);

    console.log('Przygotowuję dane importu...');
    const rawExport = await readFile(options.exportFile, 'utf8');
    const insertStatements = extractInsertStatements(rawExport);
    const { importStatements, restoreStatements } = buildPreparedData(insertStatements);

    await mkdir(TEMP_DIR, { recursive: true });
    await writeFile(options.importFile, `${importStatements.join('\n')}\n`, 'utf8');
    await writeFile(options.restoreFile, `${restoreStatements.join('\n')}\n`, 'utf8');

    console.log(`INSERT-ów do importu: ${importStatements.length}`);
    console.log(`UPDATE-ów do odtworzenia currentRankingId: ${restoreStatements.length}`);

    console.log('Aplikuję migracje do świeżego stanu lokalnego...');
    runCommand(wranglerCommand, ['d1', 'migrations', 'apply', options.databaseName, '--local', '--persist-to', persistToDir], 'y\n');

    console.log('Importuję dane...');
    runCommand(wranglerCommand, ['d1', 'execute', options.databaseName, '--local', '--file', options.importFile, '--persist-to', persistToDir]);

    console.log('Odtwarzam currentRankingId...');
    runCommand(wranglerCommand, ['d1', 'execute', options.databaseName, '--local', '--file', options.restoreFile, '--persist-to', persistToDir]);

    console.log('Sprawdzam spójność kluczy obcych...');
    runCommand(wranglerCommand, ['d1', 'execute', options.databaseName, '--local', '--persist-to', persistToDir, '--command', 'PRAGMA foreign_key_check;']);

    console.log('Sprawdzam liczbę rekordów w kluczowych tabelach...');
    for (const tableName of ['players', 'games', 'player_rankings', 'game_player_statistics', 'meetings', 'game_events']) {
        runCommand(
            wranglerCommand,
            [
                'd1',
                'execute',
                options.databaseName,
                '--local',
                '--persist-to',
                persistToDir,
                '--command',
                `SELECT COUNT(*) AS c FROM ${tableName};`,
            ],
        );
    }

    console.log('Gotowe. Lokalna baza została zaktualizowana.');
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Błąd importu: ${message}`);
    process.exitCode = 1;
});
