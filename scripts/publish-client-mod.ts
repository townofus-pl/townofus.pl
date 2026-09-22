/**
 * Publishes the client plugin and the league's hat assets, and writes the manifest the mod's
 * auto-updater polls at `/mod/client/latest.json`.
 *
 * Copy and hash in **one step**, on purpose. The failure this prevents is a manifest published
 * beside a file uploaded separately: they eventually disagree, and the symptom is every player
 * silently refusing the update while only their log says the hash did not match. Here the hash is
 * always taken from the bytes that were just written to the served path.
 *
 * Files land in `public/mod/client/`, which the Workers assets binding serves at `/mod/client/*` —
 * the same route `public/files/TownOfUs.dll` already uses. No R2 binding, no new infrastructure.
 *
 * Usage:
 *   npm run mod:publish -- --dir ~/Downloads/malkizhats     # publish everything in a folder
 *   npm run mod:publish -- --file <path>...                 # publish named files
 *   npm run mod:publish -- --check                          # verify the manifest on disk
 *
 * `--version` is optional and defaults to whatever the current manifest says. The updater
 * decides what to download from the hashes, never from the version — that field only feeds the
 * log line telling the player what they moved to — so a hat release that forgets to bump it still
 * reaches every player.
 */
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PUBLISH_DIR = 'public/mod/client';
const MANIFEST_NAME = 'latest.json';
const BASE_URL = 'https://townofus.pl/mod/client';

type ManifestFile = { name: string; url: string; sha256: string };
type Manifest = { version: string; files: ManifestFile[] };

function sha256(bytes: Buffer): string {
    return createHash('sha256').update(bytes).digest('hex');
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
    const manifestPath = path.join(PUBLISH_DIR, MANIFEST_NAME);
    return existsSync(manifestPath) ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest) : null;
}

function buildManifest(version: string, names: string[]): Manifest {
    return {
        version,
        files: names.sort().map((name) => {
            assertSafeName(name);
            return {
                name,
                url: `${BASE_URL}/${name}`,
                sha256: sha256(readFileSync(path.join(PUBLISH_DIR, name))),
            };
        }),
    };
}

/** Files in a folder, ignoring the dotfiles macOS leaves behind. */
function filesIn(dir: string): string[] {
    if (!existsSync(dir)) throw new Error(`No such folder: ${dir}`);
    return readdirSync(dir)
        .filter((name) => !name.startsWith('.'))
        .map((name) => path.join(dir, name))
        .filter((candidate) => statSync(candidate).isFile());
}

function publish(version: string | undefined, sources: string[]): void {
    mkdirSync(PUBLISH_DIR, { recursive: true });

    const before = new Map((readManifest()?.files ?? []).map((file) => [file.name, file.sha256]));

    for (const source of sources) {
        if (!existsSync(source)) throw new Error(`No such file: ${source}`);
        const name = path.basename(source);
        assertSafeName(name);
        copyFileSync(source, path.join(PUBLISH_DIR, name));
    }

    // Everything already published stays in the manifest, so a new plugin build does not silently
    // drop the hat bundle, and a hat release does not drop the plugin.
    const names = readdirSync(PUBLISH_DIR).filter((name) => name !== MANIFEST_NAME);
    if (names.length === 0) throw new Error(`Nothing to publish in ${PUBLISH_DIR}`);

    const previousVersion = readManifest()?.version;
    const manifest = buildManifest(version ?? previousVersion ?? '1.0.0', names);
    writeFileSync(path.join(PUBLISH_DIR, MANIFEST_NAME), `${JSON.stringify(manifest, null, 2)}\n`);

    // The report is the point of running this by hand: it says what players will actually
    // download, so a release that copied the wrong file is visible before it ships.
    console.log(`${MANIFEST_NAME} — version ${manifest.version}, ${manifest.files.length} file(s)\n`);
    let changed = 0;
    for (const file of manifest.files) {
        const previous = before.get(file.name);
        const state = previous === undefined ? 'NEW    ' : previous === file.sha256 ? 'same   ' : 'CHANGED';
        if (state !== 'same   ') changed += 1;
        const size = statSync(path.join(PUBLISH_DIR, file.name)).size.toLocaleString('en-US');
        console.log(`  ${state}  ${file.name.padEnd(30)} ${size.padStart(11)} B  ${file.sha256}`);
    }

    if (!version && previousVersion) {
        console.log(`\n  version left at ${previousVersion} — pass --version to change the line players see in their log.`);
    }
    console.log(
        changed === 0
            ? '\nNothing changed. Players will download nothing.'
            : `\n${changed} file(s) changed. Players fetch only those, on their next launch.`,
    );
    console.log('Commit public/mod/client/ and deploy for it to reach anyone.');
}

/** Exits non-zero if the manifest and the served files disagree. Wired into CI. */
function check(): void {
    const manifest = readManifest();
    if (!manifest) throw new Error(`No ${MANIFEST_NAME} in ${PUBLISH_DIR} — nothing published yet.`);

    const onDisk = new Set(readdirSync(PUBLISH_DIR).filter((name) => name !== MANIFEST_NAME));
    const problems: string[] = [];

    for (const file of manifest.files) {
        if (!onDisk.delete(file.name)) {
            problems.push(`${file.name}: in the manifest but not published — every client would fail it`);
            continue;
        }
        const actual = sha256(readFileSync(path.join(PUBLISH_DIR, file.name)));
        if (actual !== file.sha256.toLowerCase()) {
            problems.push(`${file.name}: manifest says ${file.sha256}, file is ${actual}`);
        }
        if (file.url !== `${BASE_URL}/${file.name}`) {
            problems.push(`${file.name}: url is ${file.url}, expected ${BASE_URL}/${file.name}`);
        }
    }

    for (const orphan of onDisk) {
        problems.push(`${orphan}: published but absent from the manifest — no client will fetch it`);
    }

    if (problems.length > 0) {
        console.error(`FAIL  ${MANIFEST_NAME} does not match the files served beside it\n`);
        for (const problem of problems) console.error(`  ${problem}`);
        console.error('\nRe-run: npm run mod:publish -- --version <v> --file <path>...');
        process.exit(1);
    }

    console.log(`PASS  ${MANIFEST_NAME} matches all ${manifest.files.length} published file(s) — version ${manifest.version}`);
}

function main(): void {
    const argv = process.argv.slice(2);

    if (argv.includes('--check')) {
        check();
        return;
    }

    const version = argv.includes('--version') ? argv[argv.indexOf('--version') + 1] : undefined;

    const sources = argv.reduce<string[]>((acc, arg, index) => {
        if (arg === '--file' && argv[index + 1]) acc.push(argv[index + 1]);
        if (arg === '--dir' && argv[index + 1]) acc.push(...filesIn(argv[index + 1]));
        return acc;
    }, []);

    if (sources.length === 0) {
        console.error('Usage: npm run mod:publish -- --dir <folder>');
        console.error('       npm run mod:publish -- --file <path>... [--version <v>]');
        console.error('       npm run mod:publish -- --check');
        process.exit(1);
    }

    publish(version, sources);
}

main();
