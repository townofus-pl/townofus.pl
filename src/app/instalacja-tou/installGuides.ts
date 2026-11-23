export type OsKey = "android" | "windows" | "mac" | "linux";

export interface GuideLink {
    label: string;
    href: string;
}

export interface GuideContent {
    title: string;
    subtitle: string;
    status?: string;
    wymagania: string[];
    kroki: string[];
    kod?: string;
    notatki?: string[];
    linki: GuideLink[];
}

export interface PlatformGuide {
    key: string;
    label: string;
    guide: GuideContent;
}

export interface OsGuides {
    key: OsKey;
    label: string;
    platforms: PlatformGuide[];
}

const RELEASES_LATEST = "https://github.com/AU-Avengers/TOU-Mira/releases/latest";
const TOUM_LINUX_GUIDE = "https://au-avengers.github.io/docs.toum.gg/docs/category/linux--steam-deck-install";

// Wydania TOU-Mira (np. 1.7.9-beta2) piszą: "needs an entire reinstall". Tekst bez numeru wersji,
// bo strona zawsze wskazuje najnowsze wydanie.
const REINSTALL_NOTE = "Przy aktualizacji ze starszego wydania zrób pełną reinstalację moda, nie nakładaj nowych plików na starą kopię.";
// Wydanie 1.7.9-beta2 ma tylko paczki x64-Steam-Epic-MsStore i x86-ItchIo, bez macOS/Linux.
const NO_MAC_LINUX_NOTE = "Najnowsze wydania nie mają osobnej paczki dla macOS i Linuksa. Zobacz przewodnik TOU-Mira dla Linuksa.";

export const installGuides: OsGuides[] = [
    {
        key: "windows",
        label: "Windows",
        platforms: [
            {
                key: "steam",
                label: "Steam",
                guide: {
                    title: "Steam",
                    subtitle: "Instalacja Town of Us: Mira przez Steam.",
                    wymagania: [
                        "Posiadasz Among Us na Steam.",
                        "Masz dostęp do lokalnych plików gry.",
                    ],
                    kroki: [
                        "Pobierz najnowsze wydanie TOU: Mira.",
                        "W bibliotece Steam kliknij PPM na Among Us i wybierz Zarządzaj > Przeglądaj pliki lokalne.",
                        "W folderze common skopiuj katalog Among Us i nazwij go np. Among Us - TOU Mira.",
                        "Rozpakuj pobrane archiwum i skopiuj całą zawartość do nowego folderu TOU Mira.",
                        "Uruchom plik Among Us.exe z folderu TOU Mira i sprawdź, czy logo moda jest w lewym górnym rogu.",
                    ],
                    notatki: [
                        "Jeśli potrzebny jest downgrade, w Steam wejdź w Właściwości > Betas i wybierz public previous.",
                    ],
                    linki: [
                        { label: "Pobierz najnowszy TOU: Mira", href: RELEASES_LATEST },
                        { label: "Among Us na Steam", href: "https://store.steampowered.com/app/945360" },
                    ],
                },
            },
            {
                key: "epic-games",
                label: "Epic Games",
                guide: {
                    title: "Epic Games",
                    subtitle: "Instalacja Town of Us: Mira przez Epic Games.",
                    wymagania: [
                        "Posiadasz Among Us na Epic Games.",
                    ],
                    kroki: [
                        "Pobierz najnowsze wydanie moda.",
                        "Przejdź do katalogu instalacji Epic Games i skopiuj folder Among Us (np. jako Among Us - TOU Mira).",
                        "Rozpakuj archiwum moda i skopiuj wszystkie pliki do nowego folderu.",
                        "Uruchom grę przez EpicGamesStarter.exe (czasami wymagane uruchomienie jako administrator).",
                    ],
                    notatki: [
                        "Jeśli wolisz, możesz użyć alternatywnie Heroic Launcher (ta sama paczka co dla Epic / Microsoft Store).",
                    ],
                    linki: [
                        { label: "Pobierz najnowszy TOU: Mira", href: RELEASES_LATEST },
                        { label: "Among Us na Epic Games", href: "https://store.epicgames.com/en-US/p/among-us" },
                    ],
                },
            },
            {
                key: "itch-io",
                label: "Itch.io",
                guide: {
                    title: "Itch.io",
                    subtitle: "Instalacja Town of Us: Mira przez Itch.io.",
                    wymagania: [
                        "Posiadasz Among Us na Itch.io.",
                        "Masz zainstalowaną aplikację Itch.io.",
                    ],
                    kroki: [
                        "Pobierz najnowsze wydanie TOU: Mira.",
                        "W bibliotece Itch.io kliknij PPM na Among Us i wybierz Manage > Open folder in explorer.",
                        "Skopiuj folder Among Us i nadaj nazwę np. Among Us - TOU Mira.",
                        "Rozpakuj paczkę moda i wklej wszystkie pliki do nowego folderu.",
                        "Uruchom Among Us.exe z folderu TOU Mira.",
                    ],
                    linki: [
                        { label: "Pobierz najnowszy TOU: Mira", href: RELEASES_LATEST },
                        { label: "Among Us na Itch.io", href: "https://innersloth.itch.io/among-us" },
                    ],
                },
            },
            {
                key: "microsoft-store",
                label: "Microsoft Store",
                guide: {
                    title: "Microsoft Store / Xbox App",
                    subtitle: "Instalacja Town of Us: Mira przez Microsoft Store lub Xbox App.",
                    wymagania: [
                        "Posiadasz Among Us na Microsoft Store lub Xbox App.",
                    ],
                    kroki: [
                        "Pobierz najnowszy TOU: Mira.",
                        "W Xbox App kliknij PPM na Among Us i wejdź w Zarządzaj.",
                        "Przejdź do zakładki Pliki i kliknij Przeglądaj.",
                        "Otwórz folder Content w katalogu gry.",
                        "Rozpakuj paczkę moda i skopiuj pliki do folderu Content.",
                        "Uruchom grę z Xbox App i sprawdź, czy logo TOU: Mira się wyświetla.",
                    ],
                    notatki: [
                        "Ta platforma nie wspiera downgrade wersji gry.",
                    ],
                    linki: [
                        { label: "Pobierz najnowszy TOU: Mira", href: RELEASES_LATEST },
                        { label: "Among Us w Microsoft Store", href: "https://apps.microsoft.com/detail/9NG07QJNK38J" },
                    ],
                },
            },
        ],
    },
    {
        key: "mac",
        label: "macOS",
        platforms: [
            {
                key: "steam",
                label: "Steam",
                guide: {
                    title: "Steam (macOS)",
                    subtitle: "Instalacja Town of Us: Mira przez Steam na macOS.",
                    wymagania: [
                        "Posiadasz Among Us na Steam.",
                        "Masz zainstalowany CrossOver.",
                    ],
                    kroki: [
                        "Zainstaluj CrossOver i doinstaluj przez niego Steam.",
                        "Zainstaluj i uruchom Among Us przynajmniej raz.",
                        "Pobierz najnowszy TOU: Mira (paczkę dla Steam).",
                        "W CrossOver otwórz dysk C i przejdź do Program Files (x86) > Steam > steamapps > common > Among Us.",
                        "Rozpakuj paczkę moda i wklej wszystkie pliki do folderu Among Us.",
                        "W konfiguracji Wine dodaj bibliotekę winhttp i uruchom grę ponownie.",
                    ],
                    kod: "Program Files (x86) > Steam > steamapps > common > Among Us",
                    notatki: [
                        "W razie potrzeby wykonaj downgrade gry w Steam (Betas > public previous).",
                        "W części przypadków pomaga najpierw instalacja TOU: Mira v1.0.0, a potem aktualizacja do najnowszej wersji.",
                    ],
                    linki: [
                        { label: "Pobierz najnowszy TOU: Mira", href: RELEASES_LATEST },
                        { label: "Przewodnik TOU-Mira dla Linuksa", href: TOUM_LINUX_GUIDE },
                        { label: "CrossOver", href: "https://www.codeweavers.com/crossover/download" },
                    ],
                },
            },
            {
                key: "heroic",
                label: "Heroic",
                guide: {
                    title: "Heroic (macOS)",
                    subtitle: "Instalacja Town of Us: Mira przez Heroic Games Launcher na macOS.",
                    wymagania: [
                        "Posiadasz Among Us na Epic Games.",
                        "Masz zainstalowany Heroic Games Launcher.",
                    ],
                    kroki: [
                        "Zainstaluj Heroic i zaloguj się na konto Epic Games.",
                        "W Wine Manager pobierz wersję Wine-Stable-MacOS.",
                        "W Library zainstaluj Among Us, otwórz Details i kliknij Install Path.",
                        "Pobierz TOU: Mira (paczkę dla Epic / Microsoft Store), rozpakuj i skopiuj pliki do folderu gry.",
                        "W ustawieniach gry ustaw pobraną wersję Wine, uruchom winecfg i dodaj bibliotekę winhttp.",
                        "Uruchom grę z Heroic i zweryfikuj logo TOU: Mira.",
                    ],
                    linki: [
                        { label: "Pobierz najnowszy TOU: Mira", href: RELEASES_LATEST },
                        { label: "Przewodnik TOU-Mira dla Linuksa", href: TOUM_LINUX_GUIDE },
                        { label: "Heroic Games Launcher", href: "https://heroicgameslauncher.com/" },
                        { label: "Among Us na Epic Games", href: "https://store.epicgames.com/en-US/p/among-us" },
                    ],
                },
            },
        ],
    },
    {
        key: "linux",
        label: "Linux",
        platforms: [
            {
                key: "steam",
                label: "Steam",
                guide: {
                    title: "Steam (Linux / Steam Deck)",
                    subtitle: "Instalacja Town of Us: Mira przez Steam na Linuxie i Steam Decku.",
                    wymagania: [
                        "Posiadasz Among Us na Steam.",
                    ],
                    kroki: [
                        "Pobierz najnowszy TOU: Mira (paczkę dla Steam).",
                        "W Steam kliknij PPM na Among Us > Zarządzaj > Przeglądaj pliki lokalne.",
                        "Rozpakuj paczkę moda i skopiuj jej zawartość do folderu gry.",
                        "W Steam ustaw opcje uruchamiania zgodnie z komendą poniżej.",
                        "Uruchom grę i sprawdź logo TOU: Mira.",
                    ],
                    kod: "WINEDLLOVERRIDES=\"winhttp=n,b\" %command%",
                    notatki: [
                        "Downgrade: Steam > Właściwości > Betas > public previous.",
                        "Na Steam Deck zwykle działa bez zmian, ale sterowanie padem może wymagać dodatkowej konfiguracji.",
                    ],
                    linki: [
                        { label: "Pobierz najnowszy TOU: Mira", href: RELEASES_LATEST },
                        { label: "Przewodnik TOU-Mira dla Linuksa", href: TOUM_LINUX_GUIDE },
                        { label: "Among Us na Steam", href: "https://store.steampowered.com/app/945360" },
                    ],
                },
            },
            {
                key: "heroic",
                label: "Heroic",
                guide: {
                    title: "Heroic (Linux)",
                    subtitle: "Instalacja Town of Us: Mira przez Heroic Launcher na Linuxie.",
                    wymagania: [
                        "Posiadasz Among Us na Epic Games.",
                        "Masz zainstalowany Heroic Launcher.",
                    ],
                    kroki: [
                        "Pobierz najnowszy TOU: Mira (paczkę dla Epic / Microsoft Store).",
                        "W Heroic, w zakładce Wine Manager, zainstaluj Wine-GE-Latest.",
                        "W Library kliknij PPM na Among Us > Details i otwórz Install Path.",
                        "Rozpakuj paczkę moda i skopiuj wszystkie pliki do folderu Among Us.",
                        "W ustawieniach Heroic uruchom winecfg, przejdź do Libraries i dodaj winhttp.",
                        "Uruchom grę z Heroic i sprawdź, czy mod się ładuje.",
                    ],
                    linki: [
                        { label: "Pobierz najnowszy TOU: Mira", href: RELEASES_LATEST },
                        { label: "Przewodnik TOU-Mira dla Linuksa", href: TOUM_LINUX_GUIDE },
                        { label: "Heroic Games Launcher", href: "https://heroicgameslauncher.com/" },
                    ],
                },
            },
            {
                key: "itch-io",
                label: "Itch.io",
                guide: {
                    title: "Itch.io (Linux)",
                    subtitle: "Przewodnik dla Itch.io na Linuxie nie jest jeszcze gotowy.",
                    status: "W przygotowaniu",
                    wymagania: [
                        "Posiadasz Among Us na Itch.io.",
                    ],
                    kroki: [
                        "Ta instrukcja zostanie uzupełniona po publikacji pełnego przewodnika.",
                        "Na ten moment użyj Linux + Steam albo Linux + Heroic.",
                    ],
                    linki: [
                        { label: "Among Us na Itch.io", href: "https://innersloth.itch.io/among-us" },
                    ],
                },
            },
        ],
    },
    {
        key: "android",
        label: "Android",
        platforms: [
            {
                key: "starlight",
                label: "Starlight",
                guide: {
                    title: "Starlight (Android)",
                    subtitle: "Instalacja Town of Us: Mira na Androidzie przez Starlight.",
                    status: "Wersja Android jest nadal oznaczona jako niewydana i eksperymentalna.",
                    wymagania: [
                        "Among Us z Google Play (lub alternatywnego sklepu, np. F-Droid / Aurora).",
                        "Aplikacja Starlight z Google Play.",
                    ],
                    kroki: [
                        "Pobierz najnowsze wydanie TOU: Mira, które wspiera Androida.",
                        "Pobierz z zakładki Assets najnowszego wydania pliki TownOfUsMira-Android.dll i MiraAPI.dll. Nie importuj TownOfUsMira.dll ani TownOfUsMira-iOS.dll.",
                        "Uruchom najpierw vanilla Among Us co najmniej raz.",
                        "Otwórz Starlight i w zakładce Mods zaimportuj pobrane pliki DLL.",
                        "Uruchom grę i sprawdź, czy logo Among Us zostało zastąpione przez Town of Us: Mira.",
                    ],
                    notatki: [
                        "Gracze Starlight na Androidzie potrzebują nowego profilu moda przy aktualizacji ze starszego wydania.",
                        "Jeśli aplikacja wymaga konta gościa, zaloguj się przez Itch.io w ustawieniach Starlight.",
                    ],
                    linki: [
                        { label: "Pobierz najnowszy TOU: Mira", href: RELEASES_LATEST },
                        { label: "Among Us w Google Play", href: "https://play.google.com/store/apps/details?id=com.innersloth.spacemafia" },
                        { label: "Starlight w Google Play", href: "https://play.google.com/store/apps/details?id=dev.allofus.starlight" },
                    ],
                },
            },
        ],
    },
];

// Uwagi z wydań TOU-Mira dopisujemy do każdego przewodnika w jednym miejscu.
for (const os of installGuides) {
    for (const platform of os.platforms) {
        const extra = [REINSTALL_NOTE];
        if (os.key === "mac" || os.key === "linux") extra.push(NO_MAC_LINUX_NOTE);
        platform.guide.notatki = [...extra, ...(platform.guide.notatki ?? [])];
    }
}
