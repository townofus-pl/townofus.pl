// Prawdziwe workerd przez Miniflare: binding R2 i fetch są tymi z produkcji, bez atrap.
// Serwer HTTP w Node udaje podpisany adres eksportu D1 w trzech wariantach nagłówków.

import { createHash } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { buildSync } from 'esbuild';
import { Miniflare } from 'miniflare';

export type Variant = 'content-length' | 'chunked' | 'gzip' | 'broken';

/** Zrzut o zadanym rozmiarze z mało powtarzalną treścią (żeby gzip nie zwinął go do kilku KB). */
export function makeBigDump(bytes: number): Buffer {
    const out = Buffer.alloc(bytes);
    let x = 123456789;
    for (let i = 0; i < bytes; i++) {
        x = (x * 1103515245 + 12345) & 0x7fffffff;
        out[i] = 97 + (x % 26);
    }
    out.write('CREATE TABLE d1_migrations (id INTEGER);\n', 0);
    return out;
}

export function sha256(data: Uint8Array): string {
    return createHash('sha256').update(data).digest('hex');
}

export async function startDownloadServer(dump: Buffer): Promise<{ server: Server; base: string; close: () => Promise<void> }> {
    const gz = gzipSync(dump);
    const server = createServer((req, res) => {
        const send = (buf: Buffer, headers: Record<string, string | number>) => {
            res.writeHead(200, headers);
            // Kawałki po 256 KiB, żeby odpowiedź była prawdziwym strumieniem.
            let offset = 0;
            const writeNext = () => {
                if (offset >= buf.length) return res.end();
                res.write(buf.subarray(offset, offset + 256 * 1024));
                offset += 256 * 1024;
                setImmediate(writeNext);
            };
            writeNext();
        };
        if (req.url === '/content-length') send(dump, { 'Content-Length': dump.length });
        else if (req.url === '/chunked') send(dump, { 'Transfer-Encoding': 'chunked' });
        else if (req.url === '/gzip') send(gz, { 'Content-Encoding': 'gzip', 'Content-Length': gz.length });
        else if (req.url === '/broken') {
            // Chunked, a part of the body, then the connection dies.
            res.writeHead(200, { 'Transfer-Encoding': 'chunked' });
            res.write(dump.subarray(0, 10 * 1024 * 1024), () => setTimeout(() => res.destroy(), 50));
        } else {
            res.writeHead(404);
            res.end();
        }
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    return { server, base, close: () => new Promise((resolve) => server.close(() => resolve())) };
}

export async function createWorkerd(): Promise<Miniflare> {
    const bundle = buildSync({
        entryPoints: [join(__dirname, 'workerd-entry.ts')],
        bundle: true,
        write: false,
        format: 'esm',
        platform: 'neutral',
        target: 'es2022',
        external: ['cloudflare:*'],
    });
    return new Miniflare({
        modules: true,
        script: bundle.outputFiles[0].text,
        r2Buckets: { SNAPSHOTS: 'snapshots-test' },
        r2Persist: false,
        compatibilityDate: '2026-05-01',
    });
}

export async function runExport(mf: Miniflare, signedUrl: string): Promise<{ ok: boolean; result?: { file: string; size: number }; error?: string }> {
    const response = await mf.dispatchFetch(`http://worker/?signedUrl=${encodeURIComponent(signedUrl)}`);
    return (await response.json()) as never;
}
