import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

type Target = 'local' | 'staging';

type ParsedOptions = {
    target: Target;
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
const STAGING_DATABASE_NAME = 'townofus_pl_preview';
const DEFAULT_EXPORT_FILE = 'db-backups/townofus-pl-remote.sql';
const DEFAULT_STATE_DIR = '.wrangler/state/v3/d1';
const TEMP_DIR = '.wrangler/tmp/import-d1';
const TEMP_IMPORT_FILE = path.join(TEMP_DIR, 'clean-import.sql');
const TEMP_RESTORE_FILE = path.join(TEMP_DIR, 'restore-player-current-ranking.sql');

const TABLE_ORDER = [
    'players',
    'games',
    'lista_cweli',
    'drama_afera_settings',
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
        target: 'local',
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

        if (argument === '--target') {
            const value = argv[(index += 1)];
            if (value !== 'local' && value !== 'staging') {
                throw new Error(`--target expects "local" or "staging" (got "${value}")`);
            }
            options.target = value;
            if (value === 'staging') options.databaseName = STAGING_DATABASE_NAME;
            continue;
        }

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
        '  --target <cel>         local (domyślnie) | staging — dokąd importować',
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

/**
 * Reads `id` and `currentRankingId` out of a `players` INSERT by **looking up the column list**
 * rather than assuming it.
 *
 * The previous version matched a literal six-column header and broke the moment migration 0009
 * added `friendCode` and `hashedProductUserId`: the very next export refused to parse, with an
 * error that pointed at the row rather than at the schema change.
 */
/** Splits a VALUES tuple on top-level commas, leaving quoted strings (which may contain them). */
function splitSqlValues(tuple: string): string[] {
    const values: string[] = [];
    let current = '';
    let inString = false;

    for (let i = 0; i < tuple.length; i += 1) {
        const char = tuple[i];

        if (inString) {
            // '' is an escaped quote inside a SQLite string literal, not the end of one.
            if (char === "'" && tuple[i + 1] === "'") {
                current += "''";
                i += 1;
                continue;
            }
            if (char === "'") inString = false;
            current += char;
            continue;
        }

        if (char === "'") {
            inString = true;
            current += char;
            continue;
        }
        if (char === ',') {
            values.push(current.trim());
            current = '';
            continue;
        }
        current += char;
    }

    values.push(current.trim());
    return values;
}

function parsePlayerReference(statement: string): RankingReference {
    const header = statement.match(/^INSERT INTO "players" \(([^)]*)\) VALUES\((.*)\);$/);
    if (!header) {
        throw new Error(`Nie udało się sparsować INSERT-a players: ${statement.slice(0, 200)}...`);
    }

    const columns = header[1].split(',').map((column) => column.trim().replace(/^"|"$/g, ''));
    const values = splitSqlValues(header[2]);

    if (columns.length !== values.length) {
        throw new Error(
            `INSERT players ma ${columns.length} kolumn i ${values.length} wartości: ${statement.slice(0, 200)}...`,
        );
    }

    const valueOf = (column: string): string => {
        const index = columns.indexOf(column);
        if (index === -1) throw new Error(`Brak kolumny "${column}" w INSERT players.`);
        return values[index];
    };

    const currentRankingId = valueOf('currentRankingId');

    return {
        playerId: Number.parseInt(valueOf('id'), 10),
        currentRankingId: currentRankingId === 'NULL' ? null : Number.parseInt(currentRankingId, 10),
    };
}

/**
 * Rewrites `currentRankingId` to NULL for the first pass, since it points at rows that do not
 * exist yet. `restoreStatements` puts the real value back afterwards.
 *
 * Column-list driven for the same reason as `parsePlayerReference`: the literal header this used
 * to match stopped existing the moment migration 0009 added two columns.
 */
function nullifyPlayerRanking(statement: string): string {
    const header = statement.match(/^INSERT INTO "players" \(([^)]*)\) VALUES\((.*)\);$/);
    if (!header) {
        throw new Error(`Nie udało się wyzerować currentRankingId w INSERT players: ${statement.slice(0, 200)}...`);
    }

    const columns = header[1].split(',').map((column) => column.trim().replace(/^"|"$/g, ''));
    const values = splitSqlValues(header[2]);
    const index = columns.indexOf('currentRankingId');
    if (index === -1) throw new Error('Brak kolumny "currentRankingId" w INSERT players.');

    values[index] = 'NULL';
    return `INSERT INTO "players" (${header[1]}) VALUES(${values.join(',')});`;
}

/**
 * Renames applied by migrations the dump predates.
 *
 * The seed dump is a `wrangler d1 export` of production, which still has the pre-#302 column
 * names, while the import applies every migration before loading it. Without this the load dies
 * on `table game_player_statistics has no column named correctMedicShields`.
 *
 * Keyed on the quoted name so it only ever touches an INSERT's column list, never a value.
 * Becomes a no-op the moment the dump is refreshed after 0009 ships.
 */
const COLUMN_RENAMES: ReadonlyArray<readonly [string, string]> = [
    ['"correctMedicShields"', '"correctProtects"'],
    ['"incorrectMedicShields"', '"incorrectProtects"'],
];

function applyColumnRenames(statement: string): string {
    return COLUMN_RENAMES.reduce((sql, [from, to]) => sql.replace(from, to), statement);
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

        const normalizedStatement = applyColumnRenames(
            tableName === 'players' ? nullifyPlayerRanking(statement) : statement,
        );

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

    if (options.target === 'local') {
        console.log('Czyścię lokalny stan D1...');
        await ensureFreshDirectory(options.stateDir);
    }

    console.log('Przygotowuję dane importu...');
    const rawExport = await readFile(options.exportFile, 'utf8');
    const insertStatements = extractInsertStatements(rawExport);
    const { importStatements, restoreStatements } = buildPreparedData(insertStatements);

    await mkdir(TEMP_DIR, { recursive: true });
    await writeFile(options.importFile, `${importStatements.join('\n')}\n`, 'utf8');
    await writeFile(options.restoreFile, `${restoreStatements.join('\n')}\n`, 'utf8');

    console.log(`INSERT-ów do importu: ${importStatements.length}`);
    console.log(`UPDATE-ów do odtworzenia currentRankingId: ${restoreStatements.length}`);

    // Local and remote differ only in how the target is addressed — and in how it is emptied.
    // Locally the whole miniflare directory is deleted above; remotely there is no directory, so
    // the tables have to be cleared explicitly in reverse FK order before the INSERTs land, or
    // the import duplicates every row.
    const where: string[] =
        options.target === 'local'
            ? ['--local', '--persist-to', persistToDir]
            : ['--remote', '--env', 'staging'];

    if (options.target === 'staging') {
        console.log('Czyszczę tabele stagingu w odwrotnej kolejności FK...');
        const deleteOrder = [...TABLE_ORDER].reverse().filter((t) => t !== 'sqlite_sequence');
        // currentRankingId points at player_rankings, so break the cycle first.
        const statements = [
            'UPDATE players SET currentRankingId = NULL;',
            ...deleteOrder.map((table) => `DELETE FROM ${table};`),
        ];
        const wipeFile = path.join(TEMP_DIR, 'wipe-staging.sql');
        await writeFile(wipeFile, `${statements.join('\n')}\n`, 'utf8');
        runCommand(wranglerCommand, ['d1', 'execute', options.databaseName, ...where, '--file', wipeFile, '--yes']);
    }

    console.log('Aplikuję migracje...');
    runCommand(
        wranglerCommand,
        ['d1', 'migrations', 'apply', options.databaseName, ...where],
        'y\n',
    );

    console.log('Importuję dane...');
    runCommand(wranglerCommand, ['d1', 'execute', options.databaseName, ...where, '--file', options.importFile, '--yes']);

    console.log('Odtwarzam currentRankingId...');
    runCommand(wranglerCommand, ['d1', 'execute', options.databaseName, ...where, '--file', options.restoreFile, '--yes']);

    console.log('Sprawdzam spójność kluczy obcych...');
    runCommand(wranglerCommand, ['d1', 'execute', options.databaseName, ...where, '--command', 'PRAGMA foreign_key_check;', '--yes']);

    console.log('Sprawdzam liczbę rekordów w kluczowych tabelach...');
    for (const tableName of ['players', 'games', 'player_rankings', 'game_player_statistics', 'meetings', 'game_events']) {
        runCommand(
            wranglerCommand,
            ['d1', 'execute', options.databaseName, ...where, '--command', `SELECT COUNT(*) AS c FROM ${tableName};`, '--yes'],
        );
    }

    console.log(`Gotowe. Baza (${options.target}) została zaktualizowana.`);
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Błąd importu: ${message}`);
    process.exitCode = 1;
});
