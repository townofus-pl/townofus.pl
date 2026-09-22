/**
 * Reconciles `public/mod/client/latest.json` with the files sitting beside it.
 *
 * The workflow is **drop the files in, then run this**. It never copies anything: whoever ships a
 * release puts the new bytes in `public/mod/client/` and this computes the hashes from what is
 * actually there. Nothing can be published that was not placed, and nothing placed can be
 * published with a hash taken from somewhere else — which is the failure this exists to prevent,
 * because a manifest that disagrees with its files makes every player refuse the update while
 * only their own log says why.
 *
 * Read-only by default. `--write` is the only thing that touches the manifest.
 *
 * Usage:
 *   npm run mod:publish                    # report: what changed, what did not
 *   npm run mod:publish -- --write         # rewrite latest.json from the files on disk
 *   npm run mod:publish -- --write --version 1.1.0
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PUBLISH_DIR = 'public/mod/client';
const MANIFEST_NAME = 'latest.json';

type ManifestFile = { name: string; url: string; sha256: string };
type Manifest = { version: string; files: ManifestFile[] };

type State = 'same' | 'CHANGED' | 'NEW' | 'MISSING';
type Row = {
    name: string;
    state: State;
    sha256: string | null;
    size: number | null;
    /** Set when the manifest's `url` is not the relative form the mod resolves beside it. */
    urlProblem?: string;
};

function sha256Of(file: string): string {
    return createHash('sha256').update(readFileSync(file)).digest('hex');
}

/**
 * The mod writes `name` straight into the player's `BepInEx/plugins` folder and refuses anything
 * containing a separator or `..`. Rejecting it here too means a bad name can never be published,
 * rather than being published and then declined by every client.
 */
function assertSafeName(name: string): void {
    if (name.includes('/') || name.includes('\\') || name.includes('..')) {
        throw new Error(`Unsafe file name for a manifest entry: ${name}`);
    }
}

function readManifest(): Manifest | null {
    const file = path.join(PUBLISH_DIR, MANIFEST_NAME);
    return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as Manifest) : null;
}

/** Everything published, ignoring the manifest itself and the dotfiles macOS leaves behind. */
function publishedFiles(): string[] {
    mkdirSync(PUBLISH_DIR, { recursive: true });
    return readdirSync(PUBLISH_DIR)
        .filter((name) => name !== MANIFEST_NAME && !name.startsWith('.'))
        .filter((name) => statSync(path.join(PUBLISH_DIR, name)).isFile())
        .sort();
}

/** One row per file, from both directions: what is on disk and what the manifest claims. */
function reconcile(): Row[] {
    const manifest = readManifest();
    const claimed = new Map((manifest?.files ?? []).map((file) => [file.name, file]));
    const onDisk = publishedFiles();

    const rows: Row[] = onDisk.map((name) => {
        const sha256 = sha256Of(path.join(PUBLISH_DIR, name));
        const previous = claimed.get(name);
        claimed.delete(name);

        // An absolute url here would send a client pointed at staging to production bytes, which
        // is exactly what DRAMAAFERA_BASE_URL exists to avoid. A leading slash is just as wrong:
        // it resolves to the site root rather than beside the manifest.
        const urlProblem =
            previous && previous.url !== name
                ? `url is "${previous.url}", expected the relative "${name}"`
                : undefined;

        return {
            name,
            state: previous === undefined ? 'NEW' : previous.sha256.toLowerCase() === sha256 ? 'same' : 'CHANGED',
            sha256,
            size: statSync(path.join(PUBLISH_DIR, name)).size,
            urlProblem,
        };
    });

    // Left in the manifest with no file beside it. Every player fails this entry on every launch.
    for (const name of claimed.keys()) {
        rows.push({ name, state: 'MISSING', sha256: null, size: null });
    }

    return rows.sort((left, right) => left.name.localeCompare(right.name));
}

function report(rows: Row[], version: string | null): void {
    console.log(`${PUBLISH_DIR}/${MANIFEST_NAME}${version ? ` — version ${version}` : ' — not written yet'}\n`);

    for (const row of rows) {
        const size = row.size === null ? '—' : row.size.toLocaleString('en-US');
        // Both, never one masking the other: a file can have changed *and* carry a stale url.
        const state = `${row.state}${row.urlProblem ? '+url' : ''}`;
        console.log(`  ${state.padEnd(11)}  ${row.name.padEnd(30)} ${size.padStart(11)} B  ${row.sha256 ?? ''}`);
    }
    if (rows.length === 0) console.log('  (nothing published)');
}

function buildManifest(version: string, rows: Row[]): Manifest {
    return {
        version,
        files: rows
            .filter((row) => row.state !== 'MISSING')
            .map((row) => {
                assertSafeName(row.name);
                return {
                    name: row.name,
                    // Relative, resolved by the mod against the manifest's own URL
                    // (`Uri.TryCreate(new Uri(manifestUrl), file.Url, …)` in AutoUpdater.cs). That
                    // is what makes DRAMAAFERA_BASE_URL work: pointed at staging, the manifest and
                    // its files both come from staging. An absolute production URL here would send
                    // a staging client to production bytes.
                    //
                    // Kept as its own field even though it currently equals `name`: `name` is where
                    // the file is written on the player's disk, `url` is where it is fetched from,
                    // and a future versioned path would change only the second.
                    url: row.name,
                    sha256: row.sha256!,
                };
            }),
    };
}

function main(): void {
    const argv = process.argv.slice(2);
    const write = argv.includes('--write');
    const versionFlag = argv.includes('--version') ? argv[argv.indexOf('--version') + 1] : undefined;

    const manifest = readManifest();
    const rows = reconcile();
    report(rows, manifest?.version ?? null);

    const pending = rows.filter((row) => row.state !== 'same' || row.urlProblem);

    if (!write) {
        if (pending.length === 0) {
            console.log(`\nPASS  the manifest matches all ${rows.length} published file(s).`);
            return;
        }

        console.error(`\nFAIL  ${pending.length} file(s) do not match the manifest:`);
        for (const row of pending) {
            const why =
                row.urlProblem ??
                {
                    CHANGED: 'the file changed since the manifest was written',
                    NEW: 'published but absent from the manifest — no client will fetch it',
                    MISSING: 'in the manifest but not published — every client fails this entry',
                    same: '',
                }[row.state];
            console.error(`  ${row.name}: ${why}`);
        }
        console.error('\nPut the intended files in public/mod/client/, then: npm run mod:publish -- --write');
        process.exit(1);
    }

    if (rows.length === 0) throw new Error(`Nothing to publish in ${PUBLISH_DIR}`);

    const version = versionFlag ?? manifest?.version ?? '1.0.0';
    const next = buildManifest(version, rows);
    writeFileSync(path.join(PUBLISH_DIR, MANIFEST_NAME), `${JSON.stringify(next, null, 2)}\n`);

    console.log(`\nWrote ${MANIFEST_NAME} — version ${next.version}, ${next.files.length} file(s).`);
    if (!versionFlag && manifest?.version) {
        console.log(`  version left at ${manifest.version} — pass --version to change the line players see in their log.`);
    }
    console.log(
        pending.length === 0
            ? '  Nothing changed; players will download nothing.'
            : `  ${pending.length} entr(ies) changed; players fetch only those, on their next launch.`,
    );
    console.log('  Commit public/mod/client/ and deploy for it to reach anyone.');
}

main();
