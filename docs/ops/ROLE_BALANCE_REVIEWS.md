# Przeglądy balansu ról

Wejście: panel hosta → Role → Przeglądy balansu. Statystyki ról pozostają w osobnym podwidoku; publiczna tabela nie przechowuje decyzji hosta.

1. Wybierz pierwszą sesję i rozpocznij próby dla nowych ról (zbiorczo albo pojedynczo).
2. Każda rola zbiera własne występy w roli początkowej. Próg 10 oznacza gotowość do przeglądu, nie automatyczny reset lub zmianę ustawień.
3. Ocena zawsze obejmuje występy do najnowszej gry w sezonie. Jeśli próba ma 13 występów, uwzględnia wszystkie 13.
4. Sprawdź dane, wybierz Buff/Nerf/Adjustment/DEKRET EMPERORA/Bez zmian, opcjonalnie dodaj notatkę i potwierdź przegląd danych do najnowszej gry.
5. Zatwierdzenie atomowo zapisuje snapshot historii i rozpoczyna kolejną próbę po ostatniej ocenionej grze. Jeśli dojdzie nowa gra przed zatwierdzeniem, przegląd wymaga odświeżenia; atomowy zapis sprawdza aktualność końcowej granicy.

Wszystkie aktywne role mają decyzje Buff, Nerf, Adjustment, DEKRET EMPERORA i Bez zmian, także w trakcie zbierania danych. Adjustment jest fioletowy, a DEKRET EMPERORA żółty, również w historii. Każda decyzja rozpoczyna nową próbę po najnowszej grze; 10 występów pozostaje progiem oznaczenia „Do przeglądu”, a nie warunkiem zatwierdzenia. Starsze wpisy „Zmiana ustawień” zachowują dotychczasową etykietę w historii. Sam upload cfg nie resetuje cykli.

W aktualnym sezonie „Zmień ustawienia roli” otwiera okno z opcjami wybranej roli ze wspólnego draftu (lub aktualnego zestawu, jeśli draftu nie ma). Zmiany pozostają lokalnie do zatwierdzenia przeglądu. Dopiero zatwierdzenie zapisuje je do draftu atomowo z historią i nową granicą próby; nie publikuje ustawień do gry. Decyzja „Bez zmian” nie może zawierać zmian opcji. Konflikt wersji draftu wymaga ponownego wczytania ustawień roli.

Ikona „i” w kółku przy wpisie historii otwiera zapis wartości przed i po zmianie. Są one przechowywane w `snapshot.settingsChanges`, więc późniejsza edycja draftu nie zmienia historii. Starsze wpisy bez tego pola pokazują brak zapisu szczegółów; nowe przeglądy bez edycji zapisują pustą listę. Nie wymaga to migracji schematu.

Próg dotyczy wszystkich występów. Do siły wchodzą tylko występy z pełną historią rankingową lobby; szczegóły pokazują obie liczby. Wzór siły pozostaje ten sam (k=3).

## Dane i spójność

- `role_balance_cycles`: granica aktywnej próby, sezon, znormalizowany klucz roli, rewizja.
- `role_balance_reviews`: decyzje, notatki, autor z Basic auth, snapshot statystyk i oceny, wersja wzoru oraz obie granice.
- Granice są parą (czas gry w znormalizowanym UTC, id), a nie czasem kliknięcia. Nie ma FK do granic gier, aby soft-delete gry nie niszczył historii decyzji.
- Sesje są grupowane zgodnie z aplikacją: prefiks daty w gameIdentifier, z fallbackiem daty startu gry. Sesje służą wyłącznie wyborowi początku pierwszej próby. Nie ma wyboru sesji końcowej ani wymogu zakończenia dnia.
- Zapis korzysta z D1 batch() oraz warunkowej rewizji. Nieaktualna próbka lub drugi host wymaga ponownego odczytu. Zapamiętane statystyki i ocena nie są przeliczane w historii po korektach danych.
- Odczyty i zapisy weryfikują host auth także wewnątrz Server Actions. Prywatne dane przeglądów nie są dodawane do publicznych odpowiedzi statystyk ról.

Migracja: `prisma/migrations/0014_role_balance_reviews.sql`. Lokalnie: `npm run db:migrate:apply:local`. Zdalne migracje wykonuje pipeline wdrożenia.
