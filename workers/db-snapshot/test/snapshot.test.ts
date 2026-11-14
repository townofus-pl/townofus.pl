import { LATEST_KEY, dumpKey, runSnapshot, stripUrls } from '../src/snapshot';
import {
    FakeBucket,
    SIGNED_URL,
    TestNonRetryableError,
    active,
    complete,
    completeNoUrl,
    makeDeps,
    makeDump,
    makeEnv,
    makeFetch,
    makeStep,
} from './fakes';

const NOW = new Date('2026-11-12T03:20:00Z');
const KEY = 'prod-20261112-0320.sql';
const OLD_LATEST = new Uint8Array([1, 2, 3]);

let logs: string[];

beforeEach(() => {
    logs = [];
    for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
        jest.spyOn(console, method).mockImplementation((...args: unknown[]) => {
            logs.push(args.map(String).join(' '));
        });
    }
});
afterEach(() => jest.restoreAllMocks());

function setup(script: Parameters<typeof makeFetch>[0], envOverrides: Partial<SnapshotEnv> = {}, partBytes?: number) {
    const bucket = new FakeBucket();
    bucket.files.set(LATEST_KEY, OLD_LATEST);
    const net = makeFetch(script);
    const { step, records } = makeStep();
    const run = () => runSnapshot(makeEnv(bucket, envOverrides), step, NOW, makeDeps(net.impl, partBytes));
    return { bucket, net, records, run };
}

describe('snapshot workflow', () => {
    it('writes the dated file and then latest.sql, with output of file name and size only', async () => {
        const dump = makeDump(1_200_000);
        const { bucket, net, records, run } = setup({ responses: [active, complete], dump });

        const result = await run();

        expect(result).toEqual({ file: LATEST_KEY, size: dump.length });
        expect(bucket.files.get(KEY)).toHaveLength(dump.length);
        expect(bucket.files.get(LATEST_KEY)).toEqual(bucket.files.get(KEY));
        // Dated file first, latest.sql last.
        expect(bucket.putBodies.map((p) => p.key)).toEqual([KEY, LATEST_KEY]);
        // Polling: first call has no bookmark, the next one passes the bookmark.
        expect(net.apiBodies).toEqual([{ output_format: 'polling' }, { output_format: 'polling', current_bookmark: 'bm-1' }]);
        expect(records.map((r) => r.name)).toEqual(['export and upload', 'check dump', 'promote latest']);
        for (const record of records) {
            expect(Object.keys(record.output as object).sort()).toEqual(['file', 'size']);
        }
    });

    it('streams the dump to R2 and does not buffer it', async () => {
        const { bucket, run } = setup({ responses: [complete], dump: makeDump(1_200_000) });
        await run();
        for (const { body } of bucket.putBodies) expect(body).toBeInstanceOf(ReadableStream);
    });

    it('limits export retries to 2 with a 5 minute delay', async () => {
        const { records, run } = setup({ responses: [complete], dump: makeDump(1_200_000) });
        await run();
        const exportStep = records[0];
        expect(exportStep.config.retries).toMatchObject({ limit: 2, delay: '5 minutes' });
        for (const record of records) expect(record.config.retries!.limit).toBeLessThanOrEqual(2);
    });

    it('retries the export when signed_url is missing', async () => {
        const dump = makeDump(1_200_000);
        const { net, records, bucket, run } = setup({ responses: [completeNoUrl, complete], dump });

        await run();

        expect(records[0].attempts).toBe(2);
        expect(records[0].errors).toEqual(['D1 export finished without a download address']);
        expect(net.apiCallCount()).toBe(2);
        expect(bucket.files.get(LATEST_KEY)).toHaveLength(dump.length);
    });

    it('fails after the retries when signed_url never appears and keeps the old latest.sql', async () => {
        const { records, bucket, run } = setup({ responses: [completeNoUrl] });
        await expect(run()).rejects.toThrow('without a download address');
        expect(records[0].attempts).toBe(3);
        expect(bucket.files.get(LATEST_KEY)).toBe(OLD_LATEST);
    });

    it('rejects a file under 1 MB and keeps the old latest.sql', async () => {
        const { bucket, run } = setup({ responses: [complete], dump: makeDump(999_999) });
        const error = await run().catch((e) => e);
        expect(error).toBeInstanceOf(TestNonRetryableError);
        expect(error.message).toContain('smaller than 1000000 bytes');
        expect(bucket.files.get(LATEST_KEY)).toBe(OLD_LATEST);
    });

    it('rejects a file without d1_migrations and keeps the old latest.sql', async () => {
        const { bucket, run } = setup({ responses: [complete], dump: makeDump(1_200_000, { migrations: false }) });
        const error = await run().catch((e) => e);
        expect(error).toBeInstanceOf(TestNonRetryableError);
        expect(error.message).toContain('no d1_migrations table');
        expect(bucket.files.get(LATEST_KEY)).toBe(OLD_LATEST);
    });

    it('finds d1_migrations when a chunk boundary splits the text', async () => {
        // Chunks are 64 KiB. The text starts 5 bytes before the first boundary.
        const dump = makeDump(1_200_000, { migrationsAt: 64 * 1024 - 5 });
        const { bucket, run } = setup({ responses: [complete], dump });
        await run();
        expect(bucket.files.get(LATEST_KEY)).toHaveLength(dump.length);
    });

    it('keeps the old latest.sql when the upload of latest.sql fails', async () => {
        const { bucket, run } = setup({ responses: [complete], dump: makeDump(1_200_000) });
        bucket.failPut.add(LATEST_KEY);
        await expect(run()).rejects.toThrow('simulated R2 failure');
        expect(bucket.files.get(LATEST_KEY)).toBe(OLD_LATEST);
        // The dated file is there for the next try.
        expect(bucket.files.get(KEY)).toHaveLength(1_200_000);
    });

    it('keeps the old latest.sql when the export fails', async () => {
        const failed = { success: true, result: { status: 'error', error: 'boom' } };
        const { bucket, run } = setup({ responses: [failed] });
        await expect(run()).rejects.toThrow('D1 export failed: boom');
        expect(bucket.files.get(LATEST_KEY)).toBe(OLD_LATEST);
        expect(bucket.files.has(KEY)).toBe(false);
    });

    it('sends the token only to the API, not to the signed URL', async () => {
        const seen: { url: string; auth: unknown }[] = [];
        const { net } = setup({ responses: [complete], dump: makeDump(1_200_000) });
        const inner = net.impl;
        const spy = (async (input: RequestInfo | URL, init?: RequestInit) => {
            seen.push({ url: String(input), auth: (init?.headers as Record<string, string> | undefined)?.Authorization });
            return inner(input, init);
        }) as typeof fetch;
        const bucket = new FakeBucket();
        const { step } = makeStep();
        await runSnapshot(makeEnv(bucket), step, NOW, makeDeps(spy));
        expect(seen.find((s) => s.url === SIGNED_URL)!.auth).toBeUndefined();
        expect(seen.find((s) => s.url !== SIGNED_URL)!.auth).toBe('Bearer token-c');
    });
});

describe('retry classes', () => {
    it.each([401, 403, 404])('does not retry on HTTP %i from the API (bad token or database)', async (status) => {
        const { records, run, net } = setup({ responses: [], apiRaw: { status, body: '{}' } });
        const error = await run().catch((e) => e);
        expect(error).toBeInstanceOf(TestNonRetryableError);
        expect(records[0].attempts).toBe(1);
        expect(net.apiCallCount()).toBe(1);
    });

    it('does not retry when the API refuses with success false', async () => {
        const refused = { success: false, errors: [{ message: 'no access' }] };
        const { records, run } = setup({ responses: [refused] });
        const error = await run().catch((e) => e);
        expect(error).toBeInstanceOf(TestNonRetryableError);
        expect(records[0].attempts).toBe(1);
    });

    it.each(['ACCOUNT_ID', 'DATABASE_ID', 'D1_EXPORT_TOKEN'] as const)('does not retry when %s is missing', async (name) => {
        const { records, run, net } = setup({ responses: [complete] }, { [name]: '' });
        const error = await run().catch((e) => e);
        expect(error).toBeInstanceOf(TestNonRetryableError);
        expect(error.message).toContain(name);
        expect(records[0].attempts).toBe(1);
        expect(net.apiCallCount()).toBe(0);
    });

    it.each([500, 502, 429])('retries on HTTP %i from the API', async (status) => {
        const { records, run } = setup({ responses: [], apiRaw: { status, body: '{}' } });
        await expect(run()).rejects.toThrow(`HTTP ${status}`);
        expect(records[0].attempts).toBe(3);
    });

    it('retries on a network error', async () => {
        const { records, run } = setup({ responses: [complete], downloadError: new Error('connection reset') });
        await expect(run()).rejects.toThrow('connection reset');
        expect(records[0].attempts).toBe(3);
    });

    it('retries when the download answers with HTTP 500', async () => {
        const { records, run } = setup({ responses: [complete], downloadStatus: 500 });
        await expect(run()).rejects.toThrow('HTTP 500');
        expect(records[0].attempts).toBe(3);
    });

    it('a transient error is not a NonRetryableError', async () => {
        const { run } = setup({ responses: [completeNoUrl] });
        const error = await run().catch((e) => e);
        expect(error).not.toBeInstanceOf(TestNonRetryableError);
    });
});

describe('no URL in logs, step output or errors', () => {
    it('keeps the signed URL out of logs and step output on success', async () => {
        const { records, run } = setup({ responses: [active, complete], dump: makeDump(1_200_000) });
        await run();
        const everything = JSON.stringify({ logs, outputs: records.map((r) => r.output), errors: records.map((r) => r.errors) });
        expect(everything).not.toContain('https://');
        expect(everything).not.toContain('X-Amz-Signature');
        expect(logs.length).toBeGreaterThan(0);
    });

    it('removes the URL from the error when the download fails with the URL in its message', async () => {
        const { records, run } = setup({
            responses: [complete],
            downloadError: new Error(`fetch failed for ${SIGNED_URL}`),
        });
        await expect(run()).rejects.toThrow('fetch failed for [url removed]');
        const everything = JSON.stringify({ logs, errors: records.map((r) => r.errors) });
        expect(everything).not.toContain('https://');
        expect(everything).not.toContain('X-Amz-Signature');
    });

    it('removes the URL from a SyntaxError of response.json() that quotes the body', async () => {
        // V8 puts a part of the body into the SyntaxError message.
        const body = `${SIGNED_URL} is not json`;
        const { records, run } = setup({ responses: [], apiRaw: { status: 200, body } });
        const error = await run().catch((e) => e);
        expect(error).toBeInstanceOf(Error);
        const everything = JSON.stringify({ message: error.message, logs, errors: records.map((r) => r.errors) });
        expect(error.message).toContain('[url removed]');
        expect(everything).not.toContain('https://');
        expect(everything).not.toContain('X-Amz-Signature');
    });

    it('stripUrls removes http(s) addresses, also in escaped JSON form', () => {
        expect(stripUrls(`a ${SIGNED_URL} b http://x.y/z`)).toBe('a [url removed] b [url removed]');
        expect(stripUrls('{"u":"https:\\/\\/r2.example.com\\/x?sig=1"}')).toBe('{"u":"[url removed]');
    });
});

describe('misc', () => {
    it('names the dated file by UTC time', () => {
        expect(dumpKey(NOW)).toBe(KEY);
    });
});

describe('upload path', () => {
    const PART = 400_000;

    it('uses one put when the download has Content-Length', async () => {
        const { bucket, run } = setup({ responses: [complete], dump: makeDump(1_200_000) }, {}, PART);
        await run();
        expect(bucket.uploads).toHaveLength(0);
        expect(bucket.putBodies.map((p) => p.key)).toEqual([KEY, LATEST_KEY]);
    });

    it.each([
        ['no Content-Length (chunked)', {}],
        ['Content-Encoding', { 'Content-Length': '123', 'Content-Encoding': 'gzip' }],
    ])('uses a multipart upload for a download with %s', async (_name, headers) => {
        const dump = makeDump(1_200_000);
        const { bucket, run } = setup({ responses: [complete], dump, downloadHeaders: headers }, {}, PART);

        await run();

        const [upload] = bucket.uploads;
        expect(bucket.uploads).toHaveLength(1);
        expect(upload.key).toBe(KEY);
        expect(upload.state).toBe('complete');
        // Equal parts, the last one is the rest: 400000, 400000, 400000.
        expect(upload.parts.map((p) => p.length)).toEqual([PART, PART, PART]);
        expect(bucket.files.get(KEY)).toEqual(dump);
        // Only the promote step uses put (the dated file went through the multipart upload).
        expect(bucket.putBodies.map((p) => p.key)).toEqual([LATEST_KEY]);
        expect(bucket.files.get(LATEST_KEY)).toEqual(dump);
    });

    it('makes a smaller last part when the size is not a multiple of the part size', async () => {
        const dump = makeDump(1_100_000);
        const { bucket, run } = setup({ responses: [complete], dump, downloadHeaders: {} }, {}, PART);
        await run();
        expect(bucket.uploads[0].parts.map((p) => p.length)).toEqual([PART, PART, 300_000]);
        expect(bucket.files.get(KEY)).toEqual(dump);
    });

    it('aborts the multipart upload when a part fails, and keeps the old latest.sql', async () => {
        const { bucket, records, run } = setup({ responses: [complete], dump: makeDump(1_200_000), downloadHeaders: {} }, {}, PART);
        bucket.failPart = 2;
        await expect(run()).rejects.toThrow('simulated part failure');
        expect(bucket.uploads.every((u) => u.state === 'aborted')).toBe(true);
        expect(records[0].attempts).toBe(3);
        expect(bucket.files.has(KEY)).toBe(false);
        expect(bucket.files.get(LATEST_KEY)).toBe(OLD_LATEST);
    });

    it('aborts the multipart upload when the download breaks in the middle', async () => {
        const { bucket, run } = setup(
            { responses: [complete], dump: makeDump(1_200_000), downloadHeaders: {}, downloadBreaksAfter: 100_000 },
            {},
            PART,
        );
        await expect(run()).rejects.toThrow('connection lost');
        expect(bucket.uploads.length).toBeGreaterThan(0);
        expect(bucket.uploads.every((u) => u.state === 'aborted')).toBe(true);
        expect(bucket.files.get(LATEST_KEY)).toBe(OLD_LATEST);
    });
});
