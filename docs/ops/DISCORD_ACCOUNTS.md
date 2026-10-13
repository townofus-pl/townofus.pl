# Konta Discord — konfiguracja i utrzymanie

Implementacja dotyczy wyłącznie `/dramaafera`. Ranking i profile pozostają publiczne. Panel hosta akceptuje obecne Basic Auth albo aktywną sesję konta Discord z jawnie nadanymi uprawnieniami hosta. Samo logowanie Discord nie nadaje uprawnień.

## Konfiguracja właściciela

1. Utwórz aplikację w https://discord.com/developers/applications (New Application). Bot, zaproszenie na serwer ani lista Discord hostów nie są potrzebne.
2. W OAuth2 dodaj dokładny Redirect URI: `https://twoja-domena/dramaafera/auth/callback`. Dla lokalnego developmentu: `http://localhost:3000/dramaafera/auth/callback`. Osobne aplikacje dla staging i produkcji ograniczają ryzyko pomylenia środowisk.
3. Ustaw `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` i `DISCORD_REDIRECT_URI` w lokalnym `.dev.vars` (plik ignorowany) i odpowiednim środowisku Workers. Sekret nie może trafiać do repozytorium ani zmiennych NEXT_PUBLIC. Przykład bez wartości znajduje się w `docs/ops/discord.dev.vars.example`.
4. Migracje lokalne: `npm run db:migrate:apply:local`. Zdalne migracje pozostają częścią istniejącego procesu wdrażania. Ta implementacja nie została wdrożona.
5. Po konfiguracji sprawdź logowanie na `/dramaafera/konto`, ponowne logowanie tym samym Discordem oraz decyzję w `/dramaafera/host` → Konta Discord.

Bez konfiguracji logowanie zwraca 503 po polsku; pozostała strona działa. Używany jest Authorization Code z samym `identify`, według https://discord.com/developers/docs/topics/oauth2 . Backend pobiera tożsamość i od razu próbuje unieważnić token Discord (timeout 5 sekund); tokeny dostępu/odświeżania nie są zapisywane. Jednorazowy state ma 10 minut i jest związany z cookie przeglądarki. Cookie sesji ma 3 dni, HttpOnly, SameSite=Lax, Path=/dramaafera i Secure na HTTPS. D1 przechowuje tylko SHA-256 losowego tokenu.

## Powiązania i decyzje

Konto wskazuje istniejący `Player.id`, nie nick, hash ani ID gracza z payloadu meczu. Zmiana nicku przez ingest zachowuje link i wyniki. `/dramaafera/gracz/[playerId]` i wariant sezonowy są stabilne; stare adresy pozostają. Kolizja sluga pokazuje wybór właściwego profilu zamiast wskazać pierwszego.

UNIQUE `discordUserId` i `playerId` oraz częściowy UNIQUE oczekującej prośby chronią obie strony. Różne konta mogą poprosić o ten sam wolny profil. Pierwsza zatwierdzona decyzja wygrywa, kolejna kończy się konfliktem z pełnym rollbackiem. Zgłoszenie nie zawiera przesłanego przez klienta accountId — tożsamość pochodzi wyłącznie z sesji. Brak anulowania/zmiany celu, aby nie obchodzić blokady odrzucenia.

Odrzucenie blokuje kolejne prośby do jawnej decyzji hosta „Zezwól na kolejną prośbę”. Korekta nie usuwa tej blokady. Korekta powiązania wymaga uzasadnienia i wersji rekordu; nigdy nie przenosi danych gier. Host widzi ograniczone identyfikatory ingest wyłącznie w chronionym panelu.

`discord_commands` jest wewnętrzną, przejściową tabelą: insert i delete w jednym D1 batch. Trigger wykonuje sprawdzenie wersji, statusu, link i audyt atomowo. Nie używamy interaktywnych transakcji Prisma. Trigger i CHECK są ręcznie utrzymywaną częścią migracji; generowane diffy trzeba przeglądać, aby ich nie usunąć. Historia zapisuje login Basic Auth albo odwołanie do konta hosta Discord, czas, powód, stare i nowe Player.id. Wspólny login Basic Auth nie rozróżnia osób. Usunięcie konta hosta zeruje odwołania do niego w cudzych audytach, pozostawiając anonimowe określenie „Host Discord”.

## Usuwanie i kopie danych

Zamknięcie konta jest pojedynczym DELETE z kaskadą FK: usuwa konto, wszystkie sesje, prośby, audyty i ewentualne komendy, w tym discordUserId, nazwę i avatar. Nie pozostawia accountId pozwalającego rozpoznać usunięte konto. Player, gry i rankingi pozostają. Możliwe jest późniejsze utworzenie nowego konta przez logowanie — usunięte dane nie są odtwarzane.

Import/seed pomija wszystkie INSERT `discord_*`: nie kopiuje produkcyjnych sesji i danych kont na staging/lokalnie. Nowe tabele są uwzględnione w odwrotnej kolejności FK czyszczenia stagingu. Istniejące eksporty i kopie sprzed zamknięcia konta mogą zawierać dane osobowe: właściciel musi objąć je polityką retencji/usuwania i nie przywracać usuniętych kont z backupu. Kod nie zarządza zewnętrznymi kopiami. Nie zapisuj Discord ID ani innych danych osobowych w uzasadnieniach lub zewnętrznych notatkach.

## Weryfikacja

`npm test -- --runInBand` obejmuje bezpieczeństwo i zachowanie handlerów. `node scripts/test-discord-d1.mjs` uruchamia osobną, nietrwałą bazę D1 w workerd/Miniflare: testuje rollback batch, rywalizujące decyzje, blokadę ponowienia, korekty, usuwanie danych i zachowanie wyników. Nie łączy się z bazą zdalną ani nie zmienia lokalnych danych rozgrywek.

## Uprawnienia hosta

Host nadaje lub odbiera uprawnienia w karcie Konta Discord. Obie decyzje wymagają uzasadnienia i dokładnego przepisania aktualnego nicku Discord wybranej osoby. Serwer i atomowy trigger sprawdzają potwierdzenie oraz wersję rekordu. Uprawniony host może zarządzać także uprawnieniami innych osób; Basic Auth pozostaje sposobem nadania pierwszych uprawnień i odzyskania dostępu.

Link Host w nawigacji jest widoczny wyłącznie po pozytywnym sprawdzeniu uprawnień przez serwer. Uprawnienia są czytane z D1 przy każdym żądaniu; odebranie ich działa na istniejące sesje bez ponownego logowania. Konta nie przechowują uprawnień w cookie.

Narzędzia hosta używają endpointów `/dramaafera/host/games` i `/dramaafera/host/season-reset`, zachowując zakres cookie `/dramaafera`. Wywołują te same handlery ingest/reset bez zmiany punktacji. Oryginalne `/api/*` nadal wymagają Basic Auth; uprawnienia Discord nie otwierają całego API administracyjnego. Wgrywanie ustawień i zapisy/usunięcia list sprawdzają hosta oraz Origin w każdej akcji. Publiczne odczyty wyników pozostają dostępne.
