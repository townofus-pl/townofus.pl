/**
 * The TOU-Mira release the league plays on. `/dramaafera/do_pobrania` uses it.
 *
 * This is the ONE place to change when the league moves to a newer version. It does not read
 * `releases/latest`: upstream publishes new versions (also betas) before the league moves, and a
 * player on `latest` would get a build that does not match the lobby.
 *
 * The public page `/instalacja-tou` is different: it points at `releases/latest` and does not
 * import this file.
 *
 * `MIRA_VERSION` in `src/roles/_generated/miraVersion.ts` is also different: it is the submodule
 * tag the role settings were generated from, and it can be ahead of the league version.
 *
 * The pin is now 1.7.9-beta2. 1.7.3 stays in `RELEASES` for a rollback: to go back, change
 * `LEAGUE_MIRA_VERSION` to '1.7.3'. To move to a newer version, add its entry to `RELEASES` and
 * change `LEAGUE_MIRA_VERSION`. Nothing else.
 */
export const LEAGUE_MIRA_VERSION = '1.7.9-beta2';

/** One row on the download page: a platform, its label and the archive to download. */
export interface MiraBuild {
    label: string;
    zip: string;
}

/**
 * The archives of each release, in the order the page shows them. One entry per platform: when
 * two platforms share an archive (1.7.3: Steam and itch.io), both entries name the same zip.
 * A release with no macOS/Linux archive (1.7.9-beta2) simply has no such entry.
 */
const RELEASES: Record<string, MiraBuild[]> = {
    '1.7.3': [
        { label: 'Steam', zip: 'TouMira.v1.7.3-x86-steam-itch.zip' },
        { label: 'itch.io', zip: 'TouMira.v1.7.3-x86-steam-itch.zip' },
        { label: 'Epic', zip: 'TouMira.v1.7.3-x64-epic-msstore.zip' },
        { label: 'Microsoft Store', zip: 'TouMira.v1.7.3-x64-epic-msstore.zip' },
        { label: 'macOS (x86) / Linux', zip: 'TouMira.v1.7.3-x86-macOS-linux.zip' },
    ],
    '1.7.9-beta2': [
        { label: 'Steam', zip: 'TouMira.v1.7.9-beta2-x64-Steam-Epic-MsStore.zip' },
        { label: 'Epic', zip: 'TouMira.v1.7.9-beta2-x64-Steam-Epic-MsStore.zip' },
        { label: 'Microsoft Store', zip: 'TouMira.v1.7.9-beta2-x64-Steam-Epic-MsStore.zip' },
        { label: 'itch.io', zip: 'TouMira.v1.7.9-beta2-x86-ItchIo.zip' },
    ],
};

const builds = RELEASES[LEAGUE_MIRA_VERSION];
if (!builds) {
    throw new Error(`No entry for release ${LEAGUE_MIRA_VERSION} in src/constants/miraRelease.ts`);
}

const BASE = 'https://github.com/AU-Avengers/TOU-Mira/releases';

export const LEAGUE_MIRA_RELEASE_URL = `${BASE}/tag/${LEAGUE_MIRA_VERSION}`;

/** The rows of the download page for the pinned release. */
export const LEAGUE_MIRA_BUILDS: readonly MiraBuild[] = builds;

export function leagueMiraDownloadUrl(zip: string): string {
    return `${BASE}/download/${LEAGUE_MIRA_VERSION}/${zip}`;
}
