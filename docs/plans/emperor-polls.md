# Plan: ankiety na stronie Drama Afera

## What we're building

Przenosimy ankiety dotyczące Emperora z Discorda na stronę. Gracze głosują bezpośrednio na stronie, a wyniki są obliczane automatycznie — bez ręcznego przepisywania głosów do plików JSON.

Plan z pulpitu, przyjęty do implementacji 13 października 2026. Użytkownik zatwierdził wszystkie rekomendacje z sekcji otwartych decyzji. Aktualne zasady i weryfikacja: `docs/ops/EMPEROR_POLLS.md`.

## Stan obecny

- Wyniki dotychczasowych ankiet są zapisane w `public/emperor-polls/<data>.json`.
- Plik zawiera datę, pytanie, sumę głosów i listę kandydatów z nickiem oraz liczbą głosów.
- `src/app/dramaafera/historia-gier/[date]/podsumowanie/PodsumowaniePageContent.tsx` odczytuje plik i przekazuje wyniki do podsumowania.
- `src/app/dramaafera/_components/PodsumowanieClient/EmperorPollSlide.tsx` pokazuje wyniki ankiety.
- Gałąź `Discord` ma logowanie i zatwierdzane powiązania kont Discord z istniejącymi graczami. To podstawa identyfikacji głosujących.

## Ustalone zasady

### Tworzenie ankiety

- Tylko host może utworzyć ankietę.
- Przycisk „Utwórz ankietę” jest dostępny na stronie rozgrywek danego dnia, a nie wyłącznie w osobnym panelu hosta.
- Dla jednego dnia istnieje tylko jedna ankieta.
- Host przed utworzeniem widzi podgląd kandydatów.
- Po utworzeniu ankieta jest dostępna w tym samym miejscu również osobom bez uprawnień hosta.

### Kandydaci

- Kandydatami jest dziesięciu graczy z najwyższą sumą `Total Points` z rozgrywek danego dnia.
- Przy remisie na dziesiątym miejscu dopuszczamy wszystkich graczy z wynikiem równym wynikowi dziesiątego gracza. Lista może liczyć więcej niż dziesięć osób.
- Lista kandydatów jest zapisywana na stałe przy utworzeniu ankiety.
- Późniejsze dodanie lub poprawienie wyników meczów nie zmienia listy kandydatów w istniejącej ankiecie.

### Głosowanie

- Głosować mogą tylko zalogowani gracze z zatwierdzonym powiązaniem konta Discord z profilem gracza.
- Powiązany gracz może głosować także wtedy, gdy nie brał udziału w rozgrywkach danego dnia.
- Hostowie również mogą głosować, jeśli mają zatwierdzone powiązanie z profilem gracza.
- Każdy gracz ma jeden głos w danej ankiecie, na jednego kandydata.
- Nie można głosować na siebie.
- Do zamknięcia ankiety można zmieniać wybór. Liczy się ostatni zapisany głos; zmiana nie dodaje kolejnego głosu.
- Wyniki są widoczne podczas głosowania: liczba i procent głosów przy kandydatach.
- Głosowanie jest jawne: widoczne jest, kto na kogo zagłosował.

### Zamknięcie

- Ankieta zamyka się automatycznie w najbliższą środę o godzinie 17:00 po jej utworzeniu.
- Obowiązuje czas polski: `Europe/Warsaw`, z uwzględnieniem zmian czasu.
- Po zamknięciu nie można oddawać ani zmieniać głosów. Wyniki pozostają dostępne.

## URL / Entry points

- Głównym miejscem jest strona rozgrywek danego dnia.
- Istniejące strony dnia: `/dramaafera/historia-gier/[date]` i `/dramaafera/sezon/[seasonId]/historia-gier/[date]`, ze wspólnym komponentem `DateGamesContent`.
- Dokładne umiejscowienie przycisku w układzie strony pozostaje do ustalenia przy implementacji.

## Component changes — UI

- Po utworzeniu przycisk „Ankieta” jest widoczny również zwykłym graczom; otwiera okno bez opuszczania strony.
- Przycisk „Ankieta” nie ma etykiet statusu „Otwarta” ani „Zakończona”.
- Przed utworzeniem tylko host ma możliwość „Utwórz ankietę”, z podglądem kandydatów.
- Okno jest wyśrodkowane. Tło strony zostaje przyciemnione i lekko rozmyte.
- Na telefonie okno dopasowuje się do dostępnego ekranu.
- Okno można zamknąć przyciskiem „X” lub klawiszem Escape.
- W oknie są kandydaci, liczby i procenty głosów oraz termin zamknięcia.
- Przy każdym kandydacie można rozwinąć listę głosujących.
- Własny wybór jest zaznaczony; wybór innego kandydata zmienia głos podczas otwartej ankiety.
- Kandydat będący bieżącym graczem nie może zostać wybrany.
- Informacja o zamknięciu i blokada głosowania znajdują się w oknie.

## Data layer changes — propozycja techniczna

- Nowe dane w D1: ankieta dnia, zapisani kandydaci oraz aktualne głosy.
- Ankieta przechowuje datę rozgrywek, kontekst sezonu, czas utworzenia i jednoznaczny termin zamknięcia.
- Kandydaci oraz głosujący są identyfikowani przez stabilne `Player.id`, a nie nick lub nazwę Discorda.
- Zapis kandydatów może zawierać wynik `Total Points` z momentu utworzenia, aby zachować podstawę wyboru.
- Unikalność ankiety dnia i głosu gracza musi być wymuszona także w bazie danych.
- Zmiana głosu aktualizuje istniejący głos. Serwer sprawdza powiązanie, termin zamknięcia, przynależność kandydata do ankiety i zakaz głosowania na siebie.
- Wyniki są agregowane z zapisanych głosów; nie utrzymujemy ręcznie edytowanych sum jako źródła prawdy.
- Serwer odrzuca głosy po terminie także wtedy, gdy użytkownik zostawił otwarte okno ankiety. Zamknięcie nie może zależeć od zegara przeglądarki ani punktualnego uruchomienia zadania cron.

## Navigation changes

Ankieta otwiera się w oknie na stronie dnia; nie wymaga osobnej strony głosowania. Istniejące adresy profili i rozgrywek pozostają punktem odniesienia.

## Rekomendacje zatwierdzone przez użytkownika

Wszystkie poniższe rekomendacje zostały zatwierdzone do implementacji:

- Gdy danego dnia jest mniej niż dziesięciu graczy: rekomendacja — dopuścić wszystkich dostępnych graczy; nie tworzyć ankiety bez kandydatów.
- Automatyczne umieszczenie nowych wyników w slajdzie podsumowania: rekomendacja — odczyt nowej ankiety z D1, z odczytem starego JSON-a tylko dla historycznych ankiet bez odpowiednika w D1. Integracja została zatwierdzona.
- Remis na pierwszym miejscu po głosowaniu: rekomendacja — pokazać równorzędnych zwycięzców; nie wprowadzać dogrywki bez osobnego ustalenia.
- Zmiana lub usunięcie powiązania konta po oddaniu głosu: głos pozostaje związany z graczem, bez powiązania z danymi konta Discord. Rekomendacja — zachować wynik związany z graczem, usuwając dane identyfikujące konto Discord zgodnie z obecnymi regułami.
- Widoczność ankiety dla niezalogowanych: rekomendacja — publiczny podgląd zgodny z publicznymi wynikami, głosowanie dopiero po zatwierdzonym powiązaniu.
- Częstotliwość odświeżania wyników i list głosujących: dobrać przy implementacji, uwzględniając koszty D1. Rekomendacja — odświeżenie po zmianie głosu i umiarkowane odświeżanie tylko podczas otwartego okna.
- Termin dla ankiety utworzonej dokładnie w środę o 17:00: rekomendacja — najbliższy termin ściśle późniejszy od utworzenia, czyli następna środa.
- Unikalność dnia między sezonami i zachowanie historycznych dat: unikalny klucz to data rozgrywek, wspólna dla sezonów. Ankieta przechowuje sezon swoich gier i jest odczytywana wyłącznie w jego kontekście.

## Design Decisions

| Decyzja | Uzgodniona wartość |
|---|---|
| Tożsamość głosującego | Zatwierdzone powiązanie Discord z graczem |
| Frekwencja w rozgrywkach | Nie jest wymagana do głosowania |
| Liczba głosów | Jeden aktualny głos gracza w ankiecie |
| Zmiana wyboru | Dozwolona do zamknięcia |
| Głos na siebie | Zabroniony |
| Wyniki i głosujący | Jawne, widoczne w trakcie głosowania |
| Kandydaci | Top 10 po sumie Total Points dnia, wraz z remisami na granicy |
| Aktualizacja kandydatów | Lista stała od utworzenia |
| Tworzenie | Host na stronie danego dnia |
| Liczba ankiet | Jedna na dzień |
| Zamknięcie | Najbliższa środa, 17:00, Europe/Warsaw |
| Interfejs | Okno z przyciemnionym i lekko rozmytym tłem |
| Przycisk | „Ankieta”, bez statusu, dostępny także zwykłym graczom po utworzeniu |

## Architecture Notes

- Wykorzystać istniejącą autoryzację hosta i sesje Discord. Samo logowanie bez zatwierdzonego powiązania nie uprawnia do oddania głosu.
- Mutacje wymagają kontroli Origin i autoryzacji po stronie serwera.
- Stosować migracje D1 i atomowe operacje, odporne na równoczesne tworzenie ankiety lub zmianę głosu.
- Nie zmieniać danych rozgrywek, punktacji i rankingu. `Total Points` służy do wyboru kandydatów. Nie publikować wag punktacji.
- Respektować kontekst sezonu i istniejące zasady soft delete; `GamePlayerStatistics` nie ma własnego `deletedAt`.
- Unikać dużych list parametrów SQL; używać selektywnych zapytań i ograniczonej paginacji list głosujących.
- Dostęp do bazy pozostaje po stronie serwera. Build bez aktywnego kontekstu Cloudflare nie może wymagać działającej bazy.
- Dostępność okna: obsługa klawiatury, utrzymanie fokusu wewnątrz, powrót fokusu do przycisku po zamknięciu i blokada przewijania tła.

## Out of scope

Bot Discord, ankiety prowadzone w samym Discordzie, zmiana punktacji, automatyczne nadawanie tytułu lub roli Emperor oraz inne typy ankiet nie były przedmiotem ustaleń.

## Proposed tasks

1. Doprecyzować pozostałe decyzje o wynikach, danych historycznych i cyklu życia głosu.
2. Zaprojektować migrację D1 dla ankiet, stałych kandydatów i pojedynczych głosów graczy.
3. Dodać tworzenie ankiety przez hosta, wyliczanie kandydatów i terminu zamknięcia.
4. Dodać odczyt ankiety, jawnych wyników i list głosujących oraz zapis/zmianę głosu.
5. Dodać przyciski na stronie dnia i dostępne okno ankiety zgodne z ustalonym UI.
6. Po potwierdzeniu integracji podłączyć nowe wyniki do podsumowania, zachowując historyczne JSON-y.
7. Zweryfikować uprawnienia, zakaz głosu na siebie, remisy, konkurencyjne zapisy i terminy w Europe/Warsaw, w tym zmianę czasu; następnie kontrole repozytorium i próba UI.

Lista jest propozycją kolejności prac, a nie zatwierdzonym podziałem na osobne zadania wykonawcze.
