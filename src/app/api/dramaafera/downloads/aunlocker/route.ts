import { NextResponse } from 'next/server';
import { withCors } from '@/app/api/_middlewares';
import { RELEASES_LATEST, dllUrl, tagFromLatestRedirect } from './_latest';

/** Where the found link is kept. Any URL works as a Cache API key. It never leaves the cache. */
const CACHE_KEY = 'https://townofus.pl/__cache/aunlocker-latest-dll';
const CACHE_SECONDS = 3600;

/** `caches.default` on Workers. Undefined in `next dev` and in tests, which then skip the cache. */
function edgeCache(): Cache | null {
    const storage = (globalThis as { caches?: CacheStorage & { default?: Cache } }).caches;
    return storage?.default ?? null;
}

/** Finds the newest DLL link, or null when GitHub does not give a release whose DLL exists. */
async function findLatestDll(): Promise<string | null> {
    const latest = await fetch(RELEASES_LATEST, { redirect: 'manual', headers: { 'User-Agent': 'townofus.pl' } });
    const tag = tagFromLatestRedirect(latest.headers.get('location'));
    if (!tag) return null;

    // GitHub answers an existing asset with a redirect to its storage, a missing one with 404.
    const url = dllUrl(tag);
    const asset = await fetch(url, { method: 'HEAD', redirect: 'manual', headers: { 'User-Agent': 'townofus.pl' } });
    return asset.status >= 200 && asset.status < 400 ? url : null;
}

/**
 * GET /api/dramaafera/downloads/aunlocker — redirects to the newest AUnlocker DLL.
 *
 * The found link is kept in the Cache API for an hour, so GitHub sees at most two requests an
 * hour per data center. The Cache API works on a custom domain (production). On workers.dev
 * (staging) it stores nothing, and each click asks GitHub. Without a release whose DLL exists,
 * the player lands on the releases page, and nothing is cached.
 */
async function getHandler(): Promise<Response> {
    const cache = edgeCache();
    let target: string | null = null;
    let cacheStatus = cache ? 'MISS' : 'NONE';

    try {
        const hit = await cache?.match(CACHE_KEY);
        if (hit) {
            target = await hit.text();
            cacheStatus = 'HIT';
        }
    } catch (error) {
        console.error('AUnlocker cache read failed:', error);
    }

    if (!target) {
        try {
            target = await findLatestDll();
            if (target && cache) {
                await cache.put(CACHE_KEY, new Response(target, {
                    headers: { 'Cache-Control': `public, max-age=${CACHE_SECONDS}` },
                }));
            }
        } catch (error) {
            console.error('AUnlocker release lookup failed:', error);
        }
    }

    return NextResponse.redirect(target ?? RELEASES_LATEST, {
        status: 302,
        // Short: the browser should come back here after a new release, not keep an old link.
        // X-AUnlocker-Cache tells whether the link came from the Cache API: HIT, MISS, or NONE where
        // there is no Cache API (next dev, tests).
        headers: { 'Cache-Control': 'public, max-age=300', 'X-AUnlocker-Cache': cacheStatus },
    });
}

export const GET = withCors(getHandler);
