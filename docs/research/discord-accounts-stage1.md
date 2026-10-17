# Konta Discord w etapie 1: podzbiór `discord_accounts` z PR #346

Ticket: [#348](https://github.com/townofus-pl/townofus.pl/issues/348). Mapa: [#347](https://github.com/townofus-pl/townofus.pl/issues/347).

## Odpowiedź

Etap 1 tworzy tylko tabelę `discord_accounts`. Bierze z PR #346 kolumny `id`, `discordUserId`, `username`, `avatar`, `playerId`, `version`, `createdAt`, `updatedAt`, `deletedAt` z tymi samymi typami i ograniczeniami. Dodaje dwie kolumny, których PR #346 nie ma: `guildNick` (nick z serwera) i `linkSource` (skąd pochodzi powiązanie: `nickMatch` albo `host`). Kolumny `retryBlocked` i `isHost`, tabele sesji, OAuth, próśb, audytu i komend oraz wszystkie triggery wchodzą w etapie 3. Etap 3 dodaje je przez `CREATE TABLE` i `ALTER TABLE ... ADD COLUMN`. Istniejących wierszy nie trzeba przepisywać.

## Źródła

- `origin/Discord:prisma/migrations/0012_discord_accounts.sql` — tabele kont, sesji, stanów OAuth, próśb, audytu, komend, triggery `discord_request_guard` i `discord_command_apply`.
- `origin/Discord:prisma/migrations/0013_discord_host_permissions.sql` — kolumna `isHost`, `actorAccountId` w audycie, nowa wersja `discord_commands` i triggera.
- `origin/Discord:prisma/migrations/0014_emperor_polls.sql` — ankieta na stronie. Nie dotyczy kont. Głos wskazuje `playerId`, nie konto.
- `origin/Discord:prisma/schema.prisma` — modele `DiscordAccount`, `DiscordSession`, `DiscordOAuthState`, `DiscordLinkRequest`, `DiscordLinkAudit`, `DiscordCommand`.
- `origin/Discord:docs/ops/DISCORD_ACCOUNTS.md` — zasady powiązań, usuwania i importu.
- `origin/Discord:src/app/dramaafera/auth/callback/get.ts` — upsert konta po logowaniu OAuth.
- `origin/Discord:src/app/dramaafera/_accounts/server.ts`, `host/konta/get.ts` — odczyt kont w sesji i w panelu hosta.
- `origin/Discord:scripts/import-d1-database.ts` — pomijanie tabel `discord_*` przy imporcie.
- `main:prisma/schema.prisma` — `Player.name` jest `@unique`. `lista_cweli.playerNames` to JSON z nickami.
- Discord API: [Interaction object](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object), [Guild Member object](https://discord.com/developers/docs/resources/guild#guild-member-object), [User object](https://discord.com/developers/docs/resources/user#user-object).

## Co PR #346 zapisuje w `discord_accounts`

Po migracjach 0012 i 0013 tabela ma kolumny:

| Kolumna | Definicja w PR #346 | Kto ją pisze w PR #346 |
|---|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | — |
| `discordUserId` | `TEXT NOT NULL UNIQUE` | callback OAuth |
| `username` | `TEXT NOT NULL` | callback OAuth (`users/@me` → `username`) |
| `avatar` | `TEXT` (null) | callback OAuth (`users/@me` → `avatar`) |
| `playerId` | `INTEGER UNIQUE REFERENCES players(id) ON DELETE RESTRICT` | tylko trigger `discord_command_apply` (approve, correct) |
| `retryBlocked` | `BOOLEAN NOT NULL DEFAULT 0` | trigger (reject, retry) |
| `isHost` | `BOOLEAN NOT NULL DEFAULT 0` (0013) | trigger (grantHost, revokeHost) |
| `version` | `INTEGER NOT NULL DEFAULT 0` | trigger, `+1` przy każdej komendzie |
| `createdAt`, `updatedAt` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` | — |
| `deletedAt` | `DATETIME` | — |

Callback OAuth robi `INSERT ... ON CONFLICT(discordUserId) DO UPDATE SET username, avatar`. Nie dotyka `playerId`. To ważne: wiersz utworzony przez bota w etapie 1 przetrwa pierwsze logowanie w etapie 3. Logowanie nadpisze tylko `username` i `avatar`.

## Kolumny i ograniczenia migracji etapu 1

```sql
CREATE TABLE discord_accounts (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 discordUserId TEXT NOT NULL UNIQUE,
 username TEXT NOT NULL,
 guildNick TEXT,
 avatar TEXT,
 playerId INTEGER UNIQUE REFERENCES players(id) ON DELETE RESTRICT,
 linkSource TEXT CHECK(linkSource IN ('nickMatch','host')),
 version INTEGER NOT NULL DEFAULT 0,
 createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 deletedAt DATETIME,
 CHECK((playerId IS NULL) = (linkSource IS NULL))
);
```

Uzasadnienie każdej kolumny:

- **`discordUserId TEXT NOT NULL UNIQUE`** — jak w PR #346. Bot dostaje ID w `member.user.id` z każdej interakcji. Callback OAuth etapu 3 robi upsert po tej kolumnie, więc musi być UNIQUE od początku.
- **`username TEXT NOT NULL`** — jak w PR #346. Bot zapisuje `member.user.username`, czyli to samo pole, które OAuth czyta z `users/@me`. Nie wpisuj tu nicku z serwera. Etap 3 nadpisze `username` przy logowaniu, a trigger `grantHost` porównuje `username` z przepisanym przez hosta nickiem (`confirmationNickname`). Inna treść w tej kolumnie dałaby dwie różne wartości zależnie od tego, kto pisał ostatni.
- **`guildNick TEXT`** — nowa kolumna, poza PR #346. Nick z serwera, po którym bot szuka gracza. Wartość: `member.nick`, a gdy go nie ma, `member.user.global_name`, a gdy go nie ma, `member.user.username`. Logowanie OAuth z zakresem `identify` nie widzi nicku z serwera, więc etap 3 tej kolumny nie nadpisze. Kolumna jest nullable, więc nie przeszkadza kontom założonym w etapie 3 przez samo logowanie.
- **`avatar TEXT`** — jak w PR #346. Interakcja i tak niesie `member.user.avatar`. Zapis nic nie kosztuje i daje avatary, zanim ktoś się zaloguje. Jeśli zespół woli nie trzymać danych, których etap 1 nie pokazuje, kolumnę można dodać w etapie 3 przez `ADD COLUMN avatar TEXT`. Obie drogi działają bez migracji danych.
- **`playerId INTEGER UNIQUE REFERENCES players(id) ON DELETE RESTRICT`** — jak w PR #346. UNIQUE gwarantuje, że jeden gracz ma najwyżej jedno konto. Nullable, bo konto bez matcha też zapisujemy.
- **`linkSource TEXT`** — nowa kolumna, poza PR #346. Opis w następnej sekcji.
- **`version INTEGER NOT NULL DEFAULT 0`** — jak w PR #346. Bot zwiększa ją przy każdej zmianie `playerId`. Trigger etapu 3 sprawdza `expectedVersion`, więc host, który patrzy na stary stan, dostanie `version_conflict` zamiast nadpisać link bota.
- **`createdAt`, `updatedAt`, `deletedAt`** — jak w PR #346 i jak każda tabela w repo (`create-migration`).

Migracja jest pisana ręcznie, tak jak 0012 w PR #346. Plik w etapie 1 dostaje następny wolny numer na `main` (dziś `0012`). Etap 3 nie może przenieść pliku 0012 z gałęzi `Discord` bez zmian, bo tworzy on `discord_accounts` od nowa. Etap 3 dostaje własną migrację z `ALTER TABLE` i nowymi tabelami.

Model w `schema.prisma` to `DiscordAccount` z PR #346 bez `retryBlocked`, `isHost` i relacji do innych tabel `discord_*`, plus `guildNick String?` i `linkSource String?`. W `Player` dochodzi `discordAccount DiscordAccount?`. Prisma nie zna CHECK. Generowane diffy trzeba przejrzeć, żeby nie usunęły CHECK (ta sama uwaga jest w `DISCORD_ACCOUNTS.md`).

## Powiązanie z matcha po nicku a powiązanie zatwierdzone przez hosta

W PR #346 `playerId` ustawia wyłącznie trigger `discord_command_apply`. Robi to po decyzji hosta (`approve` prośby albo `correct`). Każda zmiana ma wiersz w `discord_link_audits`. Nie ma kolumny, która mówi, skąd przyszedł link, bo jest tylko jedno źródło.

Etap 1 wprowadza drugie źródło: bota. Dlatego dodaje `linkSource`:

- `nickMatch` — bot ustawił link, bo `guildNick` był równy `players.name`. Nikt tego nie sprawdził.
- `host` — host zatwierdził link. Tę wartość ustawia dopiero trigger etapu 3.
- `NULL` — brak linku. CHECK `(playerId IS NULL) = (linkSource IS NULL)` pilnuje, żeby obie kolumny zmieniały się razem.

Dlaczego kolumna, a nie wiersz audytu: tabela `discord_link_audits` należy do etapu 3. Kolumna wystarcza do jednego zapytania w panelu (`WHERE linkSource='nickMatch'`) i nie wymaga przenoszenia danych. W etapie 3 bot może dodatkowo pisać audyt z `actor='bot'`, ale to nie jest warunek.

Co etap 3 musi zrobić z `linkSource`:

- Trigger `discord_command_apply` w etapie 3 ustawia `linkSource='host'` przy `approve`, przy `correct` z graczem i `NULL` przy `correct` bez gracza.
- Trigger `discord_request_guard` odrzuca prośbę, gdy konto ma już `playerId`. Konto z linkiem `nickMatch` nie złoży więc prośby. Błędny link z nicku poprawia host komendą `correct`. Etap 3 decyduje, czy panel pokazuje linki `nickMatch` jako „do potwierdzenia” i czy dodaje akcję „potwierdź” (zmiana `nickMatch` → `host` bez zmiany gracza).

## Zasady matcha i konflikty

Bot działa przy każdym kliknięciu „Gram” lub „Wypisz mnie”:

1. Upsert konta po `discordUserId`: zapisz `username`, `guildNick`, `avatar`. Nie dotykaj `playerId`.
2. Jeśli konto ma już `playerId`, użyj tego gracza. Nie szukaj po nicku.
3. Jeśli konto nie ma `playerId`, szukaj gracza: `SELECT id FROM players WHERE name=? AND deletedAt IS NULL`. Dokładne porównanie, bez `NOCASE`.
4. Przy trafieniu ustaw link jednym warunkowym `UPDATE`:

```sql
UPDATE discord_accounts
SET playerId=?1, linkSource='nickMatch', version=version+1, updatedAt=CURRENT_TIMESTAMP
WHERE discordUserId=?2 AND playerId IS NULL AND deletedAt IS NULL
AND NOT EXISTS (SELECT 1 FROM discord_accounts WHERE playerId=?1);
```

5. Na Liście Cweli zapisz `players.name` powiązanego gracza. Bez gracza zapisz `guildNick` bez zmian. Host poprawia go w panelu (ustalenie z mapy).

Krok 2 to zasada z PR #346: „Konto wskazuje istniejący `Player.id`, nie nick”. Zmiana nicku na Discordzie albo w grze nie przenosi linku.

Konflikty:

| Przypadek | Co robi bot | Dlaczego |
|---|---|---|
| Nick nie pasuje do żadnego gracza | Zapisuje konto z `playerId=NULL`. Na liście wpisuje `guildNick`. Przy następnym kliknięciu próbuje znowu. | Gracz mógł jeszcze nie zagrać. Nowe wiersze `players` tworzy ingest gry. |
| Dwa konta Discord z tym samym nickiem | Pierwsze konto dostaje link. Drugie dostaje `playerId=NULL`, bo `UPDATE` ma `NOT EXISTS` i UNIQUE `playerId`. Na liście drugie konto wpisuje `guildNick`, więc nick pojawi się dwa razy. Host to widzi i poprawia. | Nicki na serwerze nie są unikalne. `players.name` jest unikalne, więc nick wskazuje najwyżej jednego gracza. Bot nie wie, które konto jest prawdziwe. |
| Gracz jest już powiązany z innym kontem | Tak samo: brak linku dla nowego konta, wpis `guildNick`. Bot nigdy nie przenosi istniejącego linku. | Przeniesienie wymaga decyzji człowieka. W etapie 3 to `correct` hosta, z audytem. |
| Konto ma link, a nick zmienił się na nick innego gracza | Używa powiązanego gracza. Nie zmienia linku. | Link wskazuje `Player.id` (krok 2). |
| Dwa kliknięcia naraz | Jedno `UPDATE` wygrywa. Drugie zmienia 0 wierszy, bez błędu. | Warunek w `WHERE` i UNIQUE `playerId`. |
| Gracz ma `deletedAt` | Brak matcha. | Krok 3 filtruje `deletedAt IS NULL`. Trigger etapu 3 robi to samo (`player_conflict`). |

Błędny link `nickMatch` w etapie 1 (ktoś ustawił sobie nick cudzego, wolnego gracza) ma skutek tylko na Liście Cweli. Host widzi to na liście, a link poprawia SQL-em do czasu etapu 3. Narzędzie hosta do linków (`correct` w panelu „Konta Discord”) przychodzi w etapie 3. To świadome ryzyko etapu 1, bo `linkSource='nickMatch'` pozwala potem znaleźć wszystkie takie linki.

Dlaczego bez `NOCASE`: SQLite porównuje `TEXT` binarnie, a `players.name` jest UNIQUE binarnie. Mogą istnieć gracze różniący się tylko wielkością liter. Porównanie bez rozróżniania wielkości liter mogłoby dać dwa trafienia. Jeśli dokładne porównanie da za mało matchy w praktyce, etap 1 może dodać krok zapasowy: porównanie `NOCASE` tylko wtedy, gdy daje dokładnie jednego gracza.

## Co zostaje na etap 3

Kolumny w `discord_accounts` (każda przez `ALTER TABLE ... ADD COLUMN`, bez przepisywania wierszy):

- `retryBlocked BOOLEAN NOT NULL DEFAULT 0` — blokada po odrzuceniu prośby.
- `isHost BOOLEAN NOT NULL DEFAULT 0` — uprawnienia hosta w panelu (0013). Mapa ustala hosta jako rolę Discord „Host”. Etap 3 decyduje, czy `isHost` zostaje obok roli, czy zastępuje go sprawdzenie roli.

Tabele (wszystkie z 0012 i 0013):

- `discord_sessions` — sesje logowania na stronie.
- `discord_oauth_states` — jednorazowy `state` OAuth.
- `discord_link_requests` — prośby o powiązanie. CHECK na `status`, częściowy UNIQUE `discord_requests_one_pending`, indeksy.
- `discord_link_audits` — historia decyzji, z `actorAccountId` (0013).
- `discord_commands` — przejściowe komendy hosta. CHECK na `action` (wersja z 0013, z `grantHost` i `revokeHost`) i na długość `reason`.

Triggery:

- `discord_request_guard` — prośba tylko dla konta bez linku, bez blokady, na wolnego gracza.
- `discord_command_apply` — wersja z 0013, rozszerzona o zapis `linkSource` (opis wyżej).

Etap 1 nie tworzy żadnego z nich. Trigger `discord_request_guard` i komendy działają na kolumnach, które etap 1 już ma (`playerId`, `deletedAt`, `version`), plus `retryBlocked` i `isHost`, które etap 3 doda przed triggerami w tej samej migracji.

## Lista tego, co etap 3 doda

1. `ALTER TABLE discord_accounts ADD COLUMN retryBlocked BOOLEAN NOT NULL DEFAULT 0`.
2. `ALTER TABLE discord_accounts ADD COLUMN isHost BOOLEAN NOT NULL DEFAULT 0` (jeśli zostaje po decyzji o roli „Host”).
3. Tabele `discord_sessions`, `discord_oauth_states`, `discord_link_requests`, `discord_link_audits` (od razu z `actorAccountId`), `discord_commands` (od razu w wersji z 0013), z indeksami i CHECK.
4. Triggery `discord_request_guard` i `discord_command_apply`, z ustawianiem `linkSource`.
5. Modele Prisma dla nowych tabel i relacje w `DiscordAccount` i `Player` (`discordRequests`).
6. Logowanie OAuth (`auth/*`), sesja (`_accounts/*`), panel „Konta Discord” (`host/konta/*`) z PR #346.
7. Decyzja w panelu, jak traktować linki `nickMatch` (potwierdzenie albo `correct`).
8. Rozszerzenie `TABLE_ORDER` w `scripts/import-d1-database.ts` o nowe tabele.

## Dodatkowe wymagania dla etapu 1

- `scripts/import-d1-database.ts`: dodać `discord_accounts` do `TABLE_ORDER` i pomijać `INSERT` do tabel `discord_*`, tak jak w PR #346. Etap 1 zapisuje już dane osobowe (ID Discord, username, nick, avatar). Nie mogą trafić z produkcji na staging ani lokalnie.
- Zamknięcie konta w PR #346 to fizyczny `DELETE` z kaskadą. W etapie 1 nie ma UI do tego. Prośbę o usunięcie danych obsługuje się `DELETE FROM discord_accounts WHERE discordUserId=?`. Gracz, gry i ranking zostają, bo FK idzie od konta do gracza.
- `ON DELETE RESTRICT` na `playerId` blokuje twarde usunięcie gracza z linkiem. W repo gracze mają tylko soft delete (`deletedAt`), więc to nie zmienia obecnych procesów.
