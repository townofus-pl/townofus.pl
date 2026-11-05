// Atrapy do testów: R2, fetch i krok Workflow. Bez sieci i bez runtime Workers.

import type { WorkflowStep } from 'cloudflare:workers';
import type { SnapshotEnv } from '../src/env';
import type { SnapshotDeps } from '../src/snapshot';

export const SIGNED_URL = 'https://r2.example.com/signed/export-secret-token?X-Amz-Signature=abcdef';
export const API_PATH = '/accounts/acc/d1/database/db/export';

const encoder = new TextEncoder();

/** Zrzut o zadanym rozmiarze. `migrationsAt` ustawia pozycję tekstu d1_migrations (bajty). */
export function makeDump(bytes: number, opts: { migrations?: boolean; migrationsAt?: number } = {}): Uint8Array {
    const { migrations = true, migrationsAt = 0 } = opts;
    const line = 'INSERT INTO "players" VALUES (1, \'x\');\n';
    const out = new Uint8Array(bytes);
    for (let i = 0; i < bytes; i++) out[i] = line.charCodeAt(i % line.length);
    if (migrations) out.set(encoder.encode('CREATE TABLE d1_migrations (id INTEGER);'), migrationsAt);
    return out;
}

/** Strumień z danych w małych kawałkach, żeby test sprawdzał granice kawałków. */
export function streamOf(data: Uint8Array, chunk = 64 * 1024): ReadableStream<Uint8Array> {
    let offset = 0;
    return new ReadableStream({
        pull(controller) {
            if (offset >= data.length) {
                controller.close();
                return;
            }
            controller.enqueue(data.slice(offset, offset + chunk));
            offset += chunk;
        },
    });
}

async function drain(body: ReadableStream<Uint8Array>): Promise<Uint8Array> {
    const reader = body.getReader();
    const parts: Uint8Array[] = [];
    let total = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        parts.push(value);
        total += value.length;
    }
    const out = new Uint8Array(total);
    let at = 0;
    for (const part of parts) {
        out.set(part, at);
        at += part.length;
    }
    return out;
}

export class FakeBucket {
    files = new Map<string, Uint8Array>();
    putBodies: { key: string; body: unknown }[] = [];
    /** Klucze, których zapis ma się nie udać (po przeczytaniu części strumienia). */
    failPut = new Set<string>();

    async put(key: string, body: unknown): Promise<{ size: number }> {
        this.putBodies.push({ key, body });
        if (this.failPut.has(key)) throw new Error('simulated R2 failure');
        const data = await drain(body as ReadableStream<Uint8Array>);
        this.files.set(key, data);
        return { size: data.length };
    }

    async get(key: string): Promise<{ size: number; body: ReadableStream<Uint8Array> } | null> {
        const data = this.files.get(key);
        if (!data) return null;
        return { size: data.length, body: streamOf(data) };
    }
}

export interface ExportScript {
    /** Odpowiedzi API po kolei. Ostatnia powtarza się. */
    responses: unknown[];
    dump?: Uint8Array;
    /** Błąd sieci przy pobieraniu z podpisanego adresu. */
    downloadError?: Error;
}

export const complete = { success: true, result: { status: 'complete', result: { filename: 'x.sql', signed_url: SIGNED_URL } } };
export const completeNoUrl = { success: true, result: { status: 'complete', result: { filename: 'x.sql' } } };
export const active = { success: true, result: { status: 'active', at_bookmark: 'bm-1' } };

export function makeFetch(script: ExportScript) {
    const apiBodies: Record<string, string>[] = [];
    const calls: string[] = [];
    let apiCalls = 0;
    const impl = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = String(input);
        calls.push(url);
        if (url === SIGNED_URL) {
            if (script.downloadError) throw script.downloadError;
            return new Response(streamOf(script.dump ?? new Uint8Array()), { status: 200 });
        }
        if (url.endsWith(API_PATH)) {
            apiBodies.push(JSON.parse(String(init?.body)));
            const index = Math.min(apiCalls++, script.responses.length - 1);
            return new Response(JSON.stringify(script.responses[index]), { status: 200 });
        }
        throw new Error(`unexpected fetch: ${url}`);
    };
    return { impl: impl as typeof fetch, apiBodies, calls, apiCallCount: () => apiCalls };
}

export function makeEnv(bucket: FakeBucket): SnapshotEnv {
    return {
        SNAPSHOTS: bucket as unknown as R2Bucket,
        SNAPSHOT_WORKFLOW: {} as Workflow,
        ENVIRONMENT: 'staging',
        ACCOUNT_ID: 'acc',
        DATABASE_ID: 'db',
        D1_EXPORT_TOKEN: 'token-c',
    };
}

export function makeDeps(fetchImpl: typeof fetch): SnapshotDeps {
    return { fetch: fetchImpl, sleep: async () => {} };
}

export interface StepRecord {
    name: string;
    config: { retries?: { limit: number; delay: string }; timeout?: string };
    attempts: number;
    output?: unknown;
    errors: string[];
}

/** Krok Workflow, który powtarza wywołanie według `retries.limit`, bez czekania. */
export function makeStep() {
    const records: StepRecord[] = [];
    const step = {
        async do(name: string, config: StepRecord['config'], callback: () => Promise<unknown>) {
            const record: StepRecord = { name, config, attempts: 0, errors: [] };
            records.push(record);
            const limit = config.retries?.limit ?? 0;
            for (;;) {
                record.attempts++;
                try {
                    record.output = await callback();
                    return record.output;
                } catch (error) {
                    record.errors.push(error instanceof Error ? error.message : String(error));
                    if (record.attempts > limit) throw error;
                }
            }
        },
    };
    return { step: step as unknown as Pick<WorkflowStep, 'do'>, records };
}
