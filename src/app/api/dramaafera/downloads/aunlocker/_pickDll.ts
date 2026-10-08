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
