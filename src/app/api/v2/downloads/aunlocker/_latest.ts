/**
 * The newest AUnlocker DLL, found without the GitHub API.
 *
 * Upstream puts the version in the file name (`AUnlocker_v1.3.1.dll`), so a fixed
 * `releases/latest/download/<name>` link cannot exist. The API would give the name, but it allows
 * 60 calls an hour per IP without a token, and a Worker shares its IPs with other Cloudflare
 * customers. The web page `releases/latest` has no such limit: it redirects to the newest tag, and
 * every release so far names its DLL `AUnlocker_<tag>.dll`.
 */
export const RELEASES_LATEST = 'https://github.com/astra1dev/AUnlocker/releases/latest';

/** The tag in the redirect of `releases/latest`, or null when the redirect is not a release tag. */
export function tagFromLatestRedirect(location: string | null): string | null {
    const match = location?.match(/^https:\/\/github\.com\/astra1dev\/AUnlocker\/releases\/tag\/(v[0-9][\w.\-]*)$/);
    return match ? match[1] : null;
}

/** The download link of the DLL in a release. */
export function dllUrl(tag: string): string {
    return `https://github.com/astra1dev/AUnlocker/releases/download/${tag}/AUnlocker_${tag}.dll`;
}
