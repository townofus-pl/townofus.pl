import { NextResponse } from 'next/server';
import { withCors } from '@/app/api/_middlewares';
import { RELEASES_LATEST, dllUrl, tagFromLatestRedirect } from './_latest';

/**
 * The name the player gets. Upstream names each release's file with its version
 * (`AUnlocker_v1.3.1.dll`), so a new version lands next to the old one and BepInEx loads both. One
 * fixed name makes the new file replace the old. `AUnlocker.dll` is also what the project's own
 * build produces. AUnlocker is GPL-3.0, which allows passing on the unchanged file. The download
 * page links its source.
 */
const FILE_NAME = 'AUnlocker.dll';

/** Cache API keys. Any URL works as a key. They never leave the cache. */
const TAG_KEY = 'https://townofus.pl/__cache/aunlocker-latest-tag';
const FILE_KEY = (tag: string) => `https://townofus.pl/__cache/aunlocker-dll/${tag}`;

/** The newest tag is looked up again after an hour. A release's file never changes, so it stays a month. */
const TAG_SECONDS = 3600;
const FILE_SECONDS = 30 * 24 * 3600;

/** Far above the real size (44 KB in v1.3.1), so a wrong answer is not passed on. */
const MAX_BYTES = 5 * 1024 * 1024;

/** `caches.default` on Workers. Undefined in `next dev` and in tests, which then skip the cache. */
function edgeCache(): Cache | null {
    const storage = (globalThis as { caches?: CacheStorage & { default?: Cache } }).caches;
    return storage?.default ?? null;
}

/** The newest release tag, from the cache or from the redirect of `releases/latest`. */
async function latestTag(cache: Cache | null): Promise<string | null> {
    const hit = await cache?.match(TAG_KEY);
    if (hit) return hit.text();

    const latest = await fetch(RELEASES_LATEST, { redirect: 'manual', headers: { 'User-Agent': 'townofus.pl' } });
    const tag = tagFromLatestRedirect(latest.headers.get('location'));
    if (tag && cache) {
        await cache.put(TAG_KEY, new Response(tag, { headers: { 'Cache-Control': `public, max-age=${TAG_SECONDS}` } }));
    }
    return tag;
}

/** The DLL of a release, from the cache or from GitHub. Null when GitHub has no such file. */
async function releaseDll(cache: Cache | null, tag: string): Promise<{ bytes: ArrayBuffer; cached: boolean } | null> {
    const hit = await cache?.match(FILE_KEY(tag));
    if (hit) return { bytes: await hit.arrayBuffer(), cached: true };

    const response = await fetch(dllUrl(tag), { headers: { 'User-Agent': 'townofus.pl' } });
    if (!response.ok) return null;
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) return null;

    if (cache) {
        await cache.put(FILE_KEY(tag), new Response(bytes, {
            headers: { 'Cache-Control': `public, max-age=${FILE_SECONDS}`, 'Content-Type': 'application/octet-stream' },
        }));
    }
    return { bytes, cached: false };
}

/**
 * GET /api/dramaafera/downloads/aunlocker — the newest AUnlocker DLL, always named `AUnlocker.dll`.
 *
 * The release is found without the GitHub API (see `_latest.ts`). The tag and the file are kept in
 * the Cache API, which works on a custom domain (production). On workers.dev (staging) it stores
 * nothing, and each download fetches from GitHub. When GitHub gives no release with a DLL, the
 * player lands on the releases page.
 *
 * X-AUnlocker-Cache is HIT when the file came from the Cache API, MISS when it came from GitHub,
 * and NONE where there is no Cache API (next dev, tests).
 */
async function getHandler(): Promise<Response> {
    const cache = edgeCache();
    try {
        const tag = await latestTag(cache);
        const dll = tag ? await releaseDll(cache, tag) : null;
        if (tag && dll) {
            return new NextResponse(dll.bytes, {
                status: 200,
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': `attachment; filename="${FILE_NAME}"`,
                    'Cache-Control': 'public, max-age=300',
                    'X-AUnlocker-Version': tag,
                    'X-AUnlocker-Cache': cache ? (dll.cached ? 'HIT' : 'MISS') : 'NONE',
                },
            });
        }
    } catch (error) {
        console.error('AUnlocker download failed:', error);
    }

    return NextResponse.redirect(RELEASES_LATEST, { status: 302 });
}

export const GET = withCors(getHandler);
