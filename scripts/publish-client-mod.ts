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
 *   npm run mod:publish -- --version 1.0.0 --file <path>...
 *   npm run mod:publish -- --check          # verify the manifest against the served files
 */
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
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

function publish(version: string, sources: string[]): void {
    mkdirSync(PUBLISH_DIR, { recursive: true });

    for (const source of sources) {
        if (!existsSync(source)) throw new Error(`No such file: ${source}`);
        const name = path.basename(source);
        assertSafeName(name);
        copyFileSync(source, path.join(PUBLISH_DIR, name));
        console.log(`  copied ${name}`);
    }

    // Everything already published stays in the manifest, so publishing a new plugin build does
    // not silently drop the hat bundle.
    const names = readdirSync(PUBLISH_DIR).filter((name) => name !== MANIFEST_NAME);
    if (names.length === 0) throw new Error(`Nothing to publish in ${PUBLISH_DIR}`);

    const manifest = buildManifest(version, names);
    writeFileSync(path.join(PUBLISH_DIR, MANIFEST_NAME), `${JSON.stringify(manifest, null, 2)}\n`);

    console.log(`\n${MANIFEST_NAME} — version ${manifest.version}, ${manifest.files.length} file(s)`);
    for (const file of manifest.files) console.log(`  ${file.name.padEnd(32)} ${file.sha256}`);
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
        return acc;
    }, []);

    if (!version) {
        console.error('Usage: npm run mod:publish -- --version <v> [--file <path>]...');
        console.error('       npm run mod:publish -- --check');
        process.exit(1);
    }

    publish(version, sources);
}

main();
