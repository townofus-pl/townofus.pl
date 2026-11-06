import type { Miniflare } from 'miniflare';
import { createWorkerd, makeBigDump, runExport, sha256, startDownloadServer, type Variant } from './workerd';

jest.setTimeout(60_000);

const dump = makeBigDump(12 * 1024 * 1024);
let mf: Miniflare;
let download: Awaited<ReturnType<typeof startDownloadServer>>;

beforeAll(async () => {
    download = await startDownloadServer(dump);
    mf = await createWorkerd();
});
afterAll(async () => {
    await mf.dispose();
    await download.close();
});

// Przypadki z nagłówkami podpisanego adresu. Wynik zapisu w workerd:
//  - content-length: jeden put
//  - chunked (bez Content-Length): put odrzuca strumień, więc zapis wieloczęściowy
//  - gzip (Content-Encoding): workerd rozpakowuje, długość nieznana, więc zapis wieloczęściowy
describe.each(['content-length', 'chunked', 'gzip'] as Variant[])('download variant %s', (variant) => {
    it('stores the dump, checks it and promotes latest.sql in the real R2 binding', async () => {
        const outcome = await runExport(mf, `${download.base}/${variant}`);
        expect(outcome).toEqual({ ok: true, result: { file: 'latest.sql', size: dump.length } });

        const bucket = await mf.getR2Bucket('SNAPSHOTS');
        for (const key of ['prod-20261112-0320.sql', 'latest.sql']) {
            const object = await bucket.get(key);
            expect(object).not.toBeNull();
            expect(sha256(new Uint8Array(await object!.arrayBuffer()))).toBe(sha256(dump));
        }
    });
});

describe('a download that breaks in the middle', () => {
    it('leaves nothing in the real R2 binding', async () => {
        const bucket = await mf.getR2Bucket('SNAPSHOTS');
        await bucket.delete(['latest.sql', 'prod-20261112-0320.sql']);

        const outcome = await runExport(mf, `${download.base}/broken`);

        expect(outcome.ok).toBe(false);
        expect((await bucket.list()).objects).toEqual([]);
    });
});
