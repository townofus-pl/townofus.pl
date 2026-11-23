/**
 * Wydanie TOU-Mira, które strona wskazuje graczom do instalacji.
 *
 * To JEDNO miejsce do zmiany, gdy liga przechodzi na nowszą wersję. Nie czytamy `releases/latest`:
 * upstream wydaje kolejne wersje (także beta), zanim liga na nie przejdzie, a nowy gracz z
 * `latest` dostałby paczkę niezgodną z lobby. Zob. N5 w `verify-plan.md` (TOU-Mira 1.7.9-beta2).
 *
 * `MIRA_VERSION` w `src/roles/_generated/miraVersion.ts` to coś innego: tag submodułu, z którego
 * wygenerowano ustawienia ról. Może wyprzedzać wersję ligi.
 *
 * Przejście ligi na 1.7.9-beta2: zmień `LEAGUE_MIRA_VERSION` na '1.7.9-beta2'. Nic więcej.
 */
export const LEAGUE_MIRA_VERSION = '1.7.3';

/** Klucze platform z przewodnika instalacji (`installGuides.ts`) plus macOS/Linux. */
export type MiraBuildKey = 'steam' | 'itch-io' | 'epic-games' | 'microsoft-store';

interface MiraRelease {
    /** Nazwy paczek ZIP z wydania, po jednej na platformę. */
    zips: Record<MiraBuildKey, string>;
    /** Czy wydanie ma osobną paczkę dla macOS/Linuksa. Jeśli nie, tam działa paczka Windows (Wine/Proton). */
    macLinuxZip?: string;
    /** Pliki DLL dla Androida (Starlight). */
    androidDlls: string[];
    /** Uwagi do każdego przewodnika instalacji. */
    notes: string[];
    /** Uwagi tylko do przewodnika Androida. */
    androidNotes: string[];
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
        androidDlls: ['MiraAPI.dll', 'Reactor.dll', 'TownOfUs.dll'],
        notes: [],
        androidNotes: [],
    },
    '1.7.9-beta2': {
        zips: {
            steam: 'TouMira.v1.7.9-beta2-x64-Steam-Epic-MsStore.zip',
            'itch-io': 'TouMira.v1.7.9-beta2-x86-ItchIo.zip',
            'epic-games': 'TouMira.v1.7.9-beta2-x64-Steam-Epic-MsStore.zip',
            'microsoft-store': 'TouMira.v1.7.9-beta2-x64-Steam-Epic-MsStore.zip',
        },
        // Brak paczki dla macOS/Linuksa: grasz w wersję Windows przez Wine/Proton/CrossOver.
        androidDlls: ['TownOfUsMira-Android.dll', 'MiraAPI.dll'],
        notes: [
            'Ta wersja wymaga pełnej reinstalacji: nie nakładaj jej na starą kopię moda.',
        ],
        androidNotes: ['Na Androidzie (Starlight) utwórz nowy profil moda, nie używaj starego.'],
    },
};

const release = RELEASES[LEAGUE_MIRA_VERSION];
if (!release) {
    throw new Error(`Brak opisu wydania ${LEAGUE_MIRA_VERSION} w src/constants/miraRelease.ts`);
}

const BASE = 'https://github.com/AU-Avengers/TOU-Mira/releases';

export const LEAGUE_MIRA_RELEASE_URL = `${BASE}/tag/${LEAGUE_MIRA_VERSION}`;

export const LEAGUE_MIRA_ANDROID_DLLS = release.androidDlls;
export const LEAGUE_MIRA_NOTES = release.notes;
export const LEAGUE_MIRA_ANDROID_NOTES = release.androidNotes;

export function leagueMiraZip(key: MiraBuildKey): string {
    return release.zips[key];
}

/** Paczka dla macOS/Linuksa albo `undefined`, gdy wydanie jej nie ma. */
export const LEAGUE_MIRA_MAC_LINUX_ZIP = release.macLinuxZip;

export function leagueMiraDownloadUrl(asset: string): string {
    return `${BASE}/download/${LEAGUE_MIRA_VERSION}/${asset}`;
}
