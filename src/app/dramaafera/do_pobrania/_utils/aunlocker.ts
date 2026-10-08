/**
 * The plugin DLL in an AUnlocker release. Upstream names it with the version
 * (`AUnlocker_v1.3.1.dll`) next to two zips for full installs, so a fixed
 * `releases/latest/download/<name>` link cannot exist and the name is read from the release.
 */
export function pickAUnlockerDll(release: unknown): string | null {
    const assets = (release as { assets?: unknown })?.assets;
    if (!Array.isArray(assets)) return null;
    for (const asset of assets) {
        const { name, browser_download_url: url } = (asset ?? {}) as { name?: unknown; browser_download_url?: unknown };
        if (typeof name === 'string' && typeof url === 'string'
            && /^AUnlocker.*\.dll$/i.test(name) && url.startsWith('https://github.com/')) {
            return url;
        }
    }
    return null;
}

const LATEST_RELEASE_API = 'https://api.github.com/repos/astra1dev/AUnlocker/releases/latest';
export const AUNLOCKER_RELEASES_PAGE = 'https://github.com/astra1dev/AUnlocker/releases/latest';
const CACHE_SECONDS = 3600;

/**
 * The download link to the newest AUnlocker DLL, or the releases page when GitHub does not
 * answer. Read on every render of the download page, and the GitHub answer is cached at the edge
 * for an hour: unauthenticated GitHub API calls are limited per IP, and a Worker shares its IPs.
 */
export async function getAUnlockerDownloadUrl(): Promise<string> {
    try {
        const response = await fetch(LATEST_RELEASE_API, {
            headers: { 'User-Agent': 'townofus.pl', Accept: 'application/vnd.github+json' },
            cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true },
        } as RequestInit);
        if (response.ok) return pickAUnlockerDll(await response.json()) ?? AUNLOCKER_RELEASES_PAGE;
    } catch (error) {
        console.error('AUnlocker release lookup failed:', error);
    }
    return AUNLOCKER_RELEASES_PAGE;
}
