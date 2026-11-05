# Koszt D1 panelu hosta — optymalizacja nowosci

## Unikanie zbędnych odczytów

Strona hosta pobiera początkowo tylko daty sesji. Statystyki ról oraz prawdopodobieństwa są pobierane autoryzowanymi server actions dopiero po otwarciu odpowiedniej zakładki. Statystyki nie zawierają nieużywanego w tabeli rozbicia na graczy. Wcześniej obie sekcje były pobierane razem ze stroną (łącznie trzy zapytania o statystyki i prawdopodobieństwa).

Odwiedzone zakładki pozostają zamontowane w pamięci przeglądarki. Powrót z ustawień do ról lub przełączenie między podwidokami nie odpytuje ponownie D1. Przeglądy, statystyki i prawdopodobieństwa mają jawne odświeżanie. Nie ma współdzielonego cache na serwerze: zatwierdzanie przeglądu i stosowanie wag nadal odczytują aktualne dane, a tokeny konfliktów pozostają sprawdzane.

Zapis i inicjalizacja przeglądów pomijają odczyt całej historii snapshotów. Zwykły odczyt panelu wciąż pokazuje kompletną historię. Atomowy zapis przeglądu, przesunięcie granicy próby i zapis draftu zachowano.

## Prawdopodobieństwa

Próba każdej roli nadal obejmuje jej ostatnie 20 gier, nawet gdy są starsze od okna zwycięstw frakcji. Początkowe role wymagają więc odczytu sezonu. Końcowe role i modyfikator Lover są rozwiązywane tylko dla ostatnich 20 gier z aktywnymi uczestnikami; starsze występy nie potrzebują tych danych. Nie ograniczamy wszystkich danych do ostatnich 20 gier, co uszkodziłoby próbki rzadkich ról.

Zapytanie korzysta z materializowanego CTE 20 identyfikatorów, bez listy parametrów IN i bez nowych indeksów lub wymuszania planu. Sprawdzono identyczność całych wyników obliczeń na kopii lokalnej bazy:

- Sezon 2: 5027 występów, pełne dane końcowe tylko dla 346; instrukcje VM SQLite: 444464 → 347222.
- Sezon 3: 6347 występów, pełne dane końcowe tylko dla 273; instrukcje VM: 559640 → 432161.
- Sezon 4: 1152 występy, pełne dane końcowe tylko dla 272; instrukcje VM: 108456 → 88933 (około 18% mniej).

To pomiar lokalnych instrukcji VM przez progress handler SQLite, **nie** pomiar rozliczanego `rows_read` w produkcji. Timingi z taką instrumentacją nie są reprezentatywne. Biblioteka lokalnego SQLite nie udostępnia tu scanstats. Nie deklarujemy procentowej oszczędności rachunku D1 na podstawie tych danych. Plan i wyniki zapisano lokalnie w `local-only-changes/d1-optimization/`; skrypty `measure.py` i `compare.ts` używają kopii bazy. Zapytanie przeszło również przez lokalny runtime D1 z `--persist-to` wskazującym odizolowaną kopię stanu (1152 wyniki sezonu 4).

## Zapisy draftu

Autowrite łączy zmiany przez 1200 ms bezczynności zamiast 500 ms. Sekwencja szybkich kliknięć lub wpisywania trafia do jednego zapisu. Żądania pozostają serializowane; po zakończeniu zapisu nowsza zawartość jest zapisywana w kolejnej iteracji. Ostrzeżenie przed opuszczeniem strony nadal działa dla niezapisanych zmian.

Ponowne zastosowanie wag identycznych z istniejącym draftem nie aktualizuje rekordu ani rewizji. Pierwsze zastosowanie nadal tworzy draft, jeśli nie istnieje. Nie dodano okresowego odpytywania ani odczytu bazy przed każdym automatycznym zapisem.
