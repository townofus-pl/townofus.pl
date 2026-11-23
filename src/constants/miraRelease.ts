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
 * To move the league to 1.7.9-beta2: change `LEAGUE_MIRA_VERSION` to '1.7.9-beta2'. Nothing else.
 */
export const LEAGUE_MIRA_VERSION = '1.7.3';

/** Platforms for which the download page shows an archive. */
export type MiraBuildKey = 'steam' | 'itch-io' | 'epic-games' | 'microsoft-store';

interface MiraRelease {
    /** ZIP names in the release, one per platform. */
    zips: Record<MiraBuildKey, string>;
    /** Name of the separate macOS/Linux archive. Releases without it (for example 1.7.9-beta2) have none. */
    macLinuxZip?: string;
}

const RELEASES: Record<string, MiraRelease> = {
    '1.7.3': {
        zips: {
            steam: 'TouMira.v1.7.3-x86-steam-itch.zip',
            'itch-io': 'TouMira.v1.7.3-x86-steam-itch.zip',
            'epic-games': 'TouMira.v1.7.3-x64-epic-msstore.zip',
            'microsoft-store': 'TouMira.v1.7.3-x64-epic-msstore.zip',
        },
        macLinuxZip: 'TouMira.v1.7.3-x86-macOS-linux.zip',
    },
    '1.7.9-beta2': {
        zips: {
            steam: 'TouMira.v1.7.9-beta2-x64-Steam-Epic-MsStore.zip',
            'itch-io': 'TouMira.v1.7.9-beta2-x86-ItchIo.zip',
            'epic-games': 'TouMira.v1.7.9-beta2-x64-Steam-Epic-MsStore.zip',
            'microsoft-store': 'TouMira.v1.7.9-beta2-x64-Steam-Epic-MsStore.zip',
        },
        // No macOS/Linux archive (the release has only two zips: Steam/Epic/MS and ItchIo).
    },
};

const release = RELEASES[LEAGUE_MIRA_VERSION];
if (!release) {
    throw new Error(`No entry for release ${LEAGUE_MIRA_VERSION} in src/constants/miraRelease.ts`);
}

const BASE = 'https://github.com/AU-Avengers/TOU-Mira/releases';

export const LEAGUE_MIRA_RELEASE_URL = `${BASE}/tag/${LEAGUE_MIRA_VERSION}`;

export function leagueMiraZip(key: MiraBuildKey): string {
    return release.zips[key];
}

/** The macOS/Linux archive, or `undefined` when the release has none. */
export const LEAGUE_MIRA_MAC_LINUX_ZIP = release.macLinuxZip;

export function leagueMiraDownloadUrl(asset: string): string {
    return `${BASE}/download/${LEAGUE_MIRA_VERSION}/${asset}`;
}
