# Przeglądy balansu ról

Wejście: panel hosta → Role → Przeglądy balansu. Statystyki ról pozostają w osobnym podwidoku; publiczna tabela nie przechowuje decyzji hosta.

1. Wybierz pierwszą sesję i rozpocznij próby dla nowych ról (zbiorczo albo pojedynczo).
2. Każda rola zbiera własne występy w roli początkowej. Próg 10 oznacza gotowość do przeglądu, nie automatyczny reset lub zmianę ustawień.
3. Ocena zawsze obejmuje występy do najnowszej gry w sezonie. Jeśli próba ma 13 występów, uwzględnia wszystkie 13.
4. Sprawdź dane, wybierz Nerf/Buff/Bez zmian, opcjonalnie dodaj notatkę i potwierdź przegląd danych do najnowszej gry.
5. Zatwierdzenie atomowo zapisuje snapshot historii i rozpoczyna kolejną próbę po ostatniej ocenionej grze. Jeśli dojdzie nowa gra przed zatwierdzeniem, przegląd wymaga odświeżenia; atomowy zapis sprawdza aktualność końcowej granicy.

Zmiana ustawień przed progiem: wybierz decyzję „Zmiana ustawień — nowa próba”, opisz zmianę obowiązującą po najnowszej grze. Następne gry trafią do nowej próby. System nie modyfikuje ustawień moda; sam upload cfg nie resetuje cykli.

Próg dotyczy wszystkich występów. Do siły wchodzą tylko występy z pełną historią rankingową lobby; szczegóły pokazują obie liczby. Wzór siły pozostaje ten sam (k=3).

## Dane i spójność

- `role_balance_cycles`: granica aktywnej próby, sezon, znormalizowany klucz roli, rewizja.
- `role_balance_reviews`: decyzje, notatki, autor z Basic auth, snapshot statystyk i oceny, wersja wzoru oraz obie granice.
- Granice są parą (czas gry w znormalizowanym UTC, id), a nie czasem kliknięcia. Nie ma FK do granic gier, aby soft-delete gry nie niszczył historii decyzji.
- Sesje są grupowane zgodnie z aplikacją: prefiks daty w gameIdentifier, z fallbackiem daty startu gry. Sesje służą wyłącznie wyborowi początku pierwszej próby. Nie ma wyboru sesji końcowej ani wymogu zakończenia dnia.
- Zapis korzysta z D1 batch() oraz warunkowej rewizji. Nieaktualna próbka lub drugi host wymaga ponownego odczytu. Zapamiętane statystyki i ocena nie są przeliczane w historii po korektach danych.
- Odczyty i zapisy weryfikują host auth także wewnątrz Server Actions. Prywatne dane przeglądów nie są dodawane do publicznych odpowiedzi statystyk ról.

Migracja: `prisma/migrations/0014_role_balance_reviews.sql`. Lokalnie: `npm run db:migrate:apply:local`. Zdalne migracje wykonuje pipeline wdrożenia.
