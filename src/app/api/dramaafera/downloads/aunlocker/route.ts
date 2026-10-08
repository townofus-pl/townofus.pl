import { NextResponse } from 'next/server';
import { withCors } from '@/app/api/_middlewares';
import { pickAUnlockerDll } from './_pickDll';

const LATEST_RELEASE_API = 'https://api.github.com/repos/astra1dev/AUnlocker/releases/latest';
const RELEASES_PAGE = 'https://github.com/astra1dev/AUnlocker/releases/latest';
const CACHE_SECONDS = 3600;

/**
 * GET /api/dramaafera/downloads/aunlocker — redirects to the newest AUnlocker DLL.
 *
 * The download page links here, so it never needs a release to be copied in by hand. The GitHub
 * answer is cached at the edge for an hour: unauthenticated GitHub API calls are limited per IP,
 * and a Worker shares its IPs. If GitHub does not answer, the player lands on the releases page.
 */
async function getHandler(): Promise<Response> {
    let target = RELEASES_PAGE;
    try {
        const response = await fetch(LATEST_RELEASE_API, {
            headers: { 'User-Agent': 'townofus.pl', Accept: 'application/vnd.github+json' },
            cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true },
        } as RequestInit);
        if (response.ok) target = pickAUnlockerDll(await response.json()) ?? RELEASES_PAGE;
    } catch (error) {
        console.error('AUnlocker release lookup failed:', error);
    }

    return NextResponse.redirect(target, {
        status: 302,
        headers: { 'Cache-Control': `public, max-age=${CACHE_SECONDS}` },
    });
}

export const GET = withCors(getHandler);
