// Logika kopii: eksport D1, zapis do R2, kontrola pliku, podmiana latest.sql.
//
// Zasady (plan: .scratch/dramaafera/plan-db-snapshot-worker.md):
//  1. Odpytywanie eksportu idzie w jednym kroku. API anuluje eksport, który nie jest odpytywany.
//  2. latest.sql zmienia się na samym końcu. Błąd wcześniej zostawia poprzedni plik.
//  3. Nigdzie nie ma podpisanego adresu: ani w logu, ani w wyniku kroku, ani w treści błędu.
//     Stan instancji Workflow trzyma wynik i błąd kroku przez kilka dni.
//  4. Zrzut (kilkadziesiąt MB) nigdy nie leży w pamięci: strumień z fetch idzie prosto do R2,
//     a kontrola czyta strumień kawałkami.

import type { WorkflowStep } from 'cloudflare:workers';
import type { SnapshotEnv } from './env';

export const MIN_DUMP_BYTES = 1_000_000;
export const LATEST_KEY = 'latest.sql';
/** Tekst, który musi być w poprawnym zrzucie: tabela migracji Prismy/Wranglera. */
export const REQUIRED_TEXT = 'd1_migrations';

const API = 'https://api.cloudflare.com/client/v4';
const POLL_INTERVAL_MS = 3_000;
const MAX_POLLS = 100;

export interface SnapshotDeps {
    fetch: typeof fetch;
    sleep: (ms: number) => Promise<void>;
}

const defaultDeps: SnapshotDeps = {
    fetch: (input, init) => fetch(input, init),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

/** Wynik kroku: tylko nazwa pliku i rozmiar. */
export interface FileResult {
    file: string;
    size: number;
}

/** Dwa kroki z blokadą bazy (eksport) mają mało powtórzeń. Pozostałe nie blokują bazy. */
const EXPORT_STEP = {
    retries: { limit: 2, delay: '5 minutes', backoff: 'constant' },
    timeout: '15 minutes',
} as const;
const LOCAL_STEP = {
    retries: { limit: 2, delay: '1 minute', backoff: 'constant' },
    timeout: '10 minutes',
} as const;

/** `prod-YYYYMMDD-HHMM.sql` w UTC. */
export function dumpKey(now: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    const stamp = `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}-${p(now.getUTCHours())}${p(now.getUTCMinutes())}`;
    return `prod-${stamp}.sql`;
}

/** Usuwa adresy z tekstu. Każdy błąd, który opuszcza krok, przechodzi przez to. */
export function stripUrls(text: string): string {
    return text.replace(/\bhttps?:\/\/\S+/gi, '[url removed]');
}

function fail(message: string): never {
    throw new Error(stripUrls(message));
}

interface ExportResponse {
    success?: boolean;
    errors?: { message?: string }[];
    result?: {
        status?: string;
        at_bookmark?: string;
        error?: string;
        result?: { filename?: string; signed_url?: string };
    };
}

/**
 * Startuje eksport i odpytuje go do końca. Zwraca podpisany adres, który nie może wyjść poza
 * ten plik poza jednym fetch. Brak adresu po zakończeniu to błąd (krok się powtórzy).
 */
async function requestSignedUrl(env: SnapshotEnv, deps: SnapshotDeps): Promise<string> {
    const endpoint = `${API}/accounts/${env.ACCOUNT_ID}/d1/database/${env.DATABASE_ID}/export`;
    let bookmark: string | undefined;

    for (let poll = 0; poll < MAX_POLLS; poll++) {
        const body: Record<string, string> = { output_format: 'polling' };
        if (bookmark) body.current_bookmark = bookmark;

        const response = await deps.fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${env.D1_EXPORT_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) fail(`D1 export request failed with HTTP ${response.status}`);

        const json = (await response.json()) as ExportResponse;
        if (json.success === false) {
            // Treść błędu API nie zawiera adresu, ale i tak przechodzi przez stripUrls w fail().
            const detail = json.errors?.map((e) => e.message).filter(Boolean).join('; ');
            fail(`D1 export was refused${detail ? `: ${detail}` : ''}`);
        }

        const result = json.result;
        if (result?.status === 'error') fail(`D1 export failed${result.error ? `: ${result.error}` : ''}`);

        if (result?.status === 'complete') {
            const url = result.result?.signed_url;
            if (!url) fail('D1 export finished without a download address');
            return url;
        }

        bookmark = result?.at_bookmark ?? bookmark;
        await deps.sleep(POLL_INTERVAL_MS);
    }
    return fail('D1 export did not finish in time');
}

/** Krok 1: eksport i strumień do R2. Adres żyje tylko w tej funkcji. */
export async function exportToR2(env: SnapshotEnv, key: string, deps: SnapshotDeps): Promise<FileResult> {
    const signedUrl = await requestSignedUrl(env, deps);

    let download: Response;
    try {
        // Adres jest podpisany: bez nagłówka Authorization.
        download = await deps.fetch(signedUrl);
    } catch {
        // Komunikat błędu sieci może zawierać adres, więc go nie przekazujemy dalej.
        return fail('Download of the export failed');
    }
    if (!download.ok || !download.body) fail(`Download of the export failed with HTTP ${download.status}`);

    // Strumień idzie prosto do R2. Jeśli R2 odrzuci strumień bez znanej długości, wynik pokaże to test na stagingu.
    let stored: R2Object | null;
    try {
        stored = await env.SNAPSHOTS.put(key, download.body);
    } catch (error) {
        return fail(`Upload to R2 failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
    if (!stored) fail('Upload to R2 returned no object');
    return { file: key, size: stored.size };
}

/** Krok 2: rozmiar i obecność `d1_migrations`. Czyta strumień, nie trzyma pliku w pamięci. */
export async function checkDump(env: SnapshotEnv, key: string): Promise<FileResult> {
    const object = await env.SNAPSHOTS.get(key);
    if (!object) return fail(`${key} is missing in the bucket`);
    if (object.size < MIN_DUMP_BYTES) {
        await object.body.cancel();
        return fail(`${key} is smaller than ${MIN_DUMP_BYTES} bytes (${object.size}). latest.sql stays the same.`);
    }

    const reader = object.body.pipeThrough(new TextDecoderStream()).getReader();
    // Ogon poprzedniego kawałka, żeby znaleźć tekst przecięty granicą kawałków.
    let tail = '';
    let found = false;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const window = tail + value;
        if (window.includes(REQUIRED_TEXT)) {
            found = true;
            await reader.cancel();
            break;
        }
        tail = window.slice(-(REQUIRED_TEXT.length - 1));
    }
    if (!found) fail(`${key} has no ${REQUIRED_TEXT} table. latest.sql stays the same.`);
    return { file: key, size: object.size };
}

/** Krok 3: kopiuje sprawdzony plik na latest.sql. Put w R2 jest atomowy: stary plik zostaje do końca. */
export async function promoteLatest(env: SnapshotEnv, key: string): Promise<FileResult> {
    const source = await env.SNAPSHOTS.get(key);
    if (!source) return fail(`${key} is missing in the bucket`);

    let stored: R2Object | null;
    try {
        stored = await env.SNAPSHOTS.put(LATEST_KEY, source.body);
    } catch (error) {
        return fail(`Upload of ${LATEST_KEY} failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
    if (!stored || stored.size !== source.size) {
        fail(`${LATEST_KEY} size does not match ${key}`);
    }
    return { file: LATEST_KEY, size: stored.size };
}

export async function runSnapshot(
    env: SnapshotEnv,
    step: Pick<WorkflowStep, 'do'>,
    now: Date,
    deps: SnapshotDeps = defaultDeps,
): Promise<FileResult> {
    const key = dumpKey(now);

    const exported = await step.do('export and upload', EXPORT_STEP, () => exportToR2(env, key, deps));
    console.log(`export stored: ${exported.file}, ${exported.size} bytes`);

    const checked = await step.do('check dump', LOCAL_STEP, () => checkDump(env, exported.file));
    console.log(`dump checked: ${checked.file}, ${checked.size} bytes`);

    const latest = await step.do('promote latest', LOCAL_STEP, () => promoteLatest(env, checked.file));
    console.log(`latest updated: ${latest.file}, ${latest.size} bytes`);
    return latest;
}
