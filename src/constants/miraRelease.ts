/**
 * Wydanie TOU-Mira, na którym gra liga. Używa go TYLKO strona `/dramaafera/do_pobrania`.
 *
 * To JEDNO miejsce do zmiany, gdy liga przechodzi na nowszą wersję. Nie czytamy `releases/latest`:
 * upstream wydaje kolejne wersje (także beta), zanim liga na nie przejdzie, a gracz z `latest`
 * dostałby paczkę niezgodną z lobby.
 *
 * Publiczna strona `/instalacja-tou` jest inna: ona zawsze wskazuje `releases/latest`
 * i nie importuje tego pliku.
 *
 * `MIRA_VERSION` w `src/roles/_generated/miraVersion.ts` to też coś innego: tag submodułu, z którego
 * wygenerowano ustawienia ról. Może wyprzedzać wersję ligi.
 *
 * Przejście ligi na 1.7.9-beta2: zmień `LEAGUE_MIRA_VERSION` na '1.7.9-beta2'. Nic więcej.
 */
export const LEAGUE_MIRA_VERSION = '1.7.3';

/** Platformy, dla których strona pobierania pokazuje paczkę. */
export type MiraBuildKey = 'steam' | 'itch-io' | 'epic-games' | 'microsoft-store';

interface MiraRelease {
    /** Nazwy paczek ZIP z wydania, po jednej na platformę. */
    zips: Record<MiraBuildKey, string>;
    /** Nazwa osobnej paczki dla macOS/Linuksa. Gdy jej nie ma, wydanie nie wspiera macOS/Linuksa osobną paczką. */
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
        // Brak paczki dla macOS/Linuksa (wydanie ma tylko dwa zipy: Steam/Epic/MS i ItchIo).
    },
};

const release = RELEASES[LEAGUE_MIRA_VERSION];
if (!release) {
    throw new Error(`Brak opisu wydania ${LEAGUE_MIRA_VERSION} w src/constants/miraRelease.ts`);
}

const BASE = 'https://github.com/AU-Avengers/TOU-Mira/releases';

export const LEAGUE_MIRA_RELEASE_URL = `${BASE}/tag/${LEAGUE_MIRA_VERSION}`;

export function leagueMiraZip(key: MiraBuildKey): string {
    return release.zips[key];
}

/** Paczka dla macOS/Linuksa albo `undefined`, gdy wydanie jej nie ma. */
export const LEAGUE_MIRA_MAC_LINUX_ZIP = release.macLinuxZip;

export function leagueMiraDownloadUrl(asset: string): string {
    return `${BASE}/download/${LEAGUE_MIRA_VERSION}/${asset}`;
}
