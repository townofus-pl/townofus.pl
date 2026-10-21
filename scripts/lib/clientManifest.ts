/**
 * The rules for one entry of `public/mod/client/latest.json`, without I/O, so a test can drive
 * them. `scripts/publish-client-mod.ts` reads the files and the manifest and uses these checks.
 *
 * The mod's updater (client and host) takes only a bare file name for `url`, resolved beside the
 * manifest, and fails the whole update on anything else. The script refuses the same entries, so a
 * bad entry can never be published.
 */

/** `/`, `\`, `:` and `..` are the characters the mod refuses in `name` and `url`. */
export function unsafeReason(value: string): string | null {
    if (value.includes('/')) return 'contains "/"';
    if (value.includes('\\')) return 'contains "\\"';
    if (value.includes(':')) return 'contains ":"';
    if (value.includes('..')) return 'contains ".."';
    return null;
}

/** Throws when the mod would refuse `name` as a file name in `BepInEx/plugins`. */
export function assertSafeName(name: string): void {
    const reason = unsafeReason(name);
    if (reason) throw new Error(`Unsafe file name for a manifest entry: ${name} (${reason})`);
}

/**
 * Null when `url` is the bare `name`, the only form the mod accepts. Else the text for the report.
 * An absolute URL gets its own text, because it was a legitimate form until the mod dropped it.
 */
export function urlProblem(name: string, url: string): string | null {
    if (url === name) return null;
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
        return `url is the absolute "${url}". The mod accepts only the bare file name "${name}"`;
    }
    const reason = unsafeReason(url);
    return reason
        ? `url "${url}" ${reason}. The mod accepts only the bare file name "${name}"`
        : `url is "${url}", expected "${name}"`;
}
