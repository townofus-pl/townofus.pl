// Logika kopii: eksport D1, zapis do R2, kontrola pliku, podmiana latest.sql.
//
// Zasady (plan: .scratch/dramaafera/plan-db-snapshot-worker.md):
//  1. Odpytywanie eksportu idzie w jednym kroku. API anuluje eksport, który nie jest odpytywany.
//  2. latest.sql zmienia się na samym końcu. Błąd wcześniej zostawia poprzedni plik.
//  3. Nigdzie nie ma podpisanego adresu: ani w logu, ani w wyniku kroku, ani w treści błędu.
//     Stan instancji Workflow trzyma wynik i błąd kroku przez kilka dni.
//  4. Zrzut (kilkadziesiąt MB) nigdy nie leży w pamięci: strumień z fetch idzie prosto do R2,
//     a kontrola czyta strumień kawałkami.

import type { WorkflowStep } from 'cloudflare:workers'; // tylko typ: znika po kompilacji

export const MIN_DUMP_BYTES = 1_000_000;
export const LATEST_KEY = 'latest.sql';
/** Tekst, który musi być w poprawnym zrzucie: tabela migracji Prismy/Wranglera. */
export const REQUIRED_TEXT = 'd1_migrations';

/**
 * Rozmiar części zapisu wieloczęściowego. R2 wymaga co najmniej 5 MiB dla każdej części poza
 * ostatnią, a wszystkie części poza ostatnią muszą mieć ten sam rozmiar.
 */
export const PART_BYTES = 8 * 1024 * 1024;

const API = 'https://api.cloudflare.com/client/v4';
const POLL_INTERVAL_MS = 3_000;
const MAX_POLLS = 100;

export interface SnapshotDeps {
    fetch: typeof fetch;
    sleep: (ms: number) => Promise<void>;
    /**
     * `NonRetryableError` z `cloudflare:workflows`. Wstrzykiwany, bo Node (Jest) nie ładuje modułów `cloudflare:*`.
     * Błąd tej klasy kończy krok bez ponowień.
     */
    NonRetryableError: new (message: string) => Error;
    /** Rozmiar części przy zapisie wieloczęściowym. Domyślnie PART_BYTES. Test ustawia mały. */
    partBytes?: number;
}

/** Zależności produkcyjne. Klasę błędu podaje workflow.ts. */
export function createDeps(NonRetryableError: SnapshotDeps['NonRetryableError']): SnapshotDeps {
    return {
        fetch: (input, init) => fetch(input, init),
        sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
        NonRetryableError,
    };
}

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

/** Usuwa adresy z tekstu, także w postaci JSON (`https:\/\/`). Każdy błąd opuszczający krok przechodzi przez to. */
export function stripUrls(text: string): string {
    return text.replace(/https?:(?:\\?\/){2}\S*/gi, '[url removed]');
}

/** Błąd, którego ponowienie nie naprawi (zły token, zły plik). Guard zamienia go na NonRetryableError. */
class StableError extends Error {}

/** Błąd stabilny: krok kończy się od razu, bez nowego eksportu. */
function stable(message: string): never {
    throw new StableError(message);
}

/** Błąd przejściowy: Workflow ponowi krok (maksymalnie 2 razy). */
function transient(message: string): never {
    throw new Error(message);
}

/**
 * Każdy błąd opuszczający krok przechodzi tędy: tekst bez adresów, a klasa zależy od tego, czy
 * ponowienie ma sens. Łapie też błędy z cudzego kodu, np. SyntaxError z `response.json()`, który
 * cytuje fragment odpowiedzi.
 */
async function guard<T>(deps: SnapshotDeps, work: () => Promise<T>): Promise<T> {
    try {
        return await work();
    } catch (error) {
        const message = stripUrls(error instanceof Error ? error.message : String(error));
        if (error instanceof StableError || error instanceof deps.NonRetryableError) {
            throw new deps.NonRetryableError(message);
        }
        throw new Error(message);
    }
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

/** Brak wartości z konfiguracji to błąd wdrożenia: ponowienie go nie naprawi. */
function requireConfig(env: SnapshotEnv): void {
    for (const name of ['ACCOUNT_ID', 'DATABASE_ID', 'D1_EXPORT_TOKEN'] as const) {
        if (!env[name]) stable(`Config value ${name} is not set`);
    }
}

/**
 * Startuje eksport i odpytuje go do końca. Zwraca podpisany adres, który nie wychodzi poza
 * exportToR2. Brak adresu po zakończeniu to błąd przejściowy (krok się powtórzy).
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
        if (!response.ok) {
            const message = `D1 export request failed with HTTP ${response.status}`;
            // 4xx (zły token, zła baza) się nie poprawi. 408 i 429 mijają, 5xx też.
            const isStable = response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429;
            return isStable ? stable(message) : transient(message);
        }

        const json = (await response.json()) as ExportResponse;
        if (json.success === false) {
            const detail = json.errors?.map((e) => e.message).filter(Boolean).join('; ');
            stable(`D1 export was refused${detail ? `: ${detail}` : ''}`);
        }

        const result = json.result;
        if (result?.status === 'error') transient(`D1 export failed${result.error ? `: ${result.error}` : ''}`);

        if (result?.status === 'complete') {
            const url = result.result?.signed_url;
            if (!url) transient('D1 export finished without a download address');
            return url;
        }

        bookmark = result?.at_bookmark ?? bookmark;
        await deps.sleep(POLL_INTERVAL_MS);
    }
    return transient('D1 export did not finish in time');
}


/**
 * Zapisuje strumień z pobrania do R2 bez trzymania pliku w pamięci.
 *
 * `R2Bucket.put` przyjmuje strumień tylko ze znaną długością (zmierzone w workerd: chunked i
 * Content-Encoding kończą się błędem "must have a known length"). Dlatego:
 *  - Content-Length i brak Content-Encoding: jeden `put`.
 *  - inaczej: zapis wieloczęściowy, części po `partBytes`, w pamięci leży najwyżej jedna część.
 * Nieudany zapis wieloczęściowy jest przerywany (`abort`), żeby w R2 nie zostały osierocone części.
 */
async function storeDownload(bucket: R2Bucket, key: string, download: Response, deps: SnapshotDeps): Promise<R2Object> {
    const body = download.body!;
    const length = Number(download.headers.get('content-length'));
    const knownLength = Number.isFinite(length) && length > 0 && !download.headers.get('content-encoding');
    if (knownLength) {
        const stored = await bucket.put(key, body);
        if (!stored) transient('Upload to R2 returned no object');
        return stored;
    }

    const partBytes = deps.partBytes ?? PART_BYTES;
    const upload = await bucket.createMultipartUpload(key);
    try {
        const parts: R2UploadedPart[] = [];
        const reader = body.getReader();
        const buffer = new Uint8Array(partBytes);
        let filled = 0;
        const flush = async (size: number) => {
            parts.push(await upload.uploadPart(parts.length + 1, buffer.subarray(0, size)));
            filled = 0;
        };
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            let offset = 0;
            while (offset < value.length) {
                const take = Math.min(partBytes - filled, value.length - offset);
                buffer.set(value.subarray(offset, offset + take), filled);
                filled += take;
                offset += take;
                if (filled === partBytes) await flush(partBytes);
            }
        }
        // Ostatnia część może być mniejsza. Pusty plik nie ma części i R2 go nie przyjmie.
        if (filled > 0) await flush(filled);
        if (parts.length === 0) transient('The download was empty');
        return await upload.complete(parts);
    } catch (error) {
        await upload.abort().catch(() => undefined);
        throw error;
    }
}

/** Krok 1: eksport i strumień do R2. Adres żyje tylko w tej funkcji. */
export function exportToR2(env: SnapshotEnv, key: string, deps: SnapshotDeps): Promise<FileResult> {
    return guard(deps, async () => {
        requireConfig(env);
        const signedUrl = await requestSignedUrl(env, deps);

        // Adres jest podpisany: bez nagłówka Authorization.
        const download = await deps.fetch(signedUrl);
        if (!download.ok || !download.body) transient(`Download of the export failed with HTTP ${download.status}`);

        const stored = await storeDownload(env.SNAPSHOTS, key, download, deps);
        return { file: key, size: stored.size };
    });
}

/** Krok 2: rozmiar i obecność `d1_migrations`. Czyta strumień, nie trzyma pliku w pamięci. */
export function checkDump(env: SnapshotEnv, key: string, deps: SnapshotDeps): Promise<FileResult> {
    return guard(deps, async () => {
        const object = await env.SNAPSHOTS.get(key);
        if (!object) return stable(`${key} is missing in the bucket`);
        if (object.size < MIN_DUMP_BYTES) {
            await object.body.cancel();
            return stable(`${key} is smaller than ${MIN_DUMP_BYTES} bytes (${object.size}). latest.sql stays the same.`);
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
        if (!found) stable(`${key} has no ${REQUIRED_TEXT} table. latest.sql stays the same.`);
        return { file: key, size: object.size };
    });
}

/** Krok 3: kopiuje sprawdzony plik na latest.sql. Put w R2 jest atomowy: stary plik zostaje do końca. */
export function promoteLatest(env: SnapshotEnv, key: string, deps: SnapshotDeps): Promise<FileResult> {
    return guard(deps, async () => {
        const source = await env.SNAPSHOTS.get(key);
        if (!source) return stable(`${key} is missing in the bucket`);

        const stored = await env.SNAPSHOTS.put(LATEST_KEY, source.body);
        if (!stored || stored.size !== source.size) transient(`${LATEST_KEY} size does not match ${key}`);
        return { file: LATEST_KEY, size: stored.size };
    });
}

export async function runSnapshot(
    env: SnapshotEnv,
    step: Pick<WorkflowStep, 'do'>,
    now: Date,
    deps: SnapshotDeps,
): Promise<FileResult> {
    const key = dumpKey(now);

    const exported = await step.do('export and upload', EXPORT_STEP, () => exportToR2(env, key, deps));
    console.log(`export stored: ${exported.file}, ${exported.size} bytes`);

    const checked = await step.do('check dump', LOCAL_STEP, () => checkDump(env, exported.file, deps));
    console.log(`dump checked: ${checked.file}, ${checked.size} bytes`);

    const latest = await step.do('promote latest', LOCAL_STEP, () => promoteLatest(env, checked.file, deps));
    console.log(`latest updated: ${latest.file}, ${latest.size} bytes`);
    return latest;
}
