# Ankiety Emperora

Na stronie dnia (`/dramaafera/historia-gier/[date]` i wariant sezonowy) host widzi
„Utwórz ankietę” z podglądem kandydatów. Po utworzeniu każdy widzi „Ankieta”.
Tworzenie korzysta z obecnego Basic Auth albo aktywnej sesji Discord hosta.
Głosowanie wymaga sesji Discord i zatwierdzonego powiązania z graczem.
Okno pokazuje avatary i nicki kandydatów bez ich punktacji z rozgrywek.
Kolejność jest losowana przy otwarciu i pozostaje stała podczas zmiany głosu
oraz odświeżania wyników.

## Zasady

- Jedna ankieta na datę rozgrywek, również między sezonami. Przechowywany sezon
  odpowiada grom użytym do wyboru kandydatów; odczyt z innego sezonu nie pokazuje ankiety.
- Kandydaci: suma `totalPoints` gracza z gier tego dnia i sezonu. Top 10 wraz
  z remisami na granicy; przy mniejszej liczbie wszyscy, przy zerowej brak ankiety.
  Usunięte gry i gracze są pomijani. Lista i suma punktów są zapisanym snapshotem.
- Jeden aktualny głos na `Player.id`; można zmieniać wybór, nie można wybrać siebie.
  Udział w grach dnia nie jest wymagany. Listy głosujących są publiczne, stronicowane po 20.
- Najbliższa środa o 17:00 `Europe/Warsaw`, ściśle późniejsza od utworzenia.
  Termin jest zapisany jako czas UTC w milisekundach. Zmiana czasu jest uwzględniona.
  SQL i triggery sprawdzają zegar bazy podczas zapisu, bez crona.
- Remis po zamknięciu daje równorzędnych zwycięzców. Zero głosów nie wyłania zwycięzcy.
- Głosy odnoszą się wyłącznie do gracza, bez danych Discord i identyfikatorów kont.
  Zamknięcie lub korekta powiązania konta zachowuje poprzedni głos gracza.
  Inne konto powiązane później z tym samym graczem zarządza tym samym głosem.
- Podsumowanie czyta wyniki D1; historyczny JSON pozostaje fallbackiem, gdy dla
  tego dnia i sezonu nie ma ankiety D1. Nowa ankieta z zerem głosów też zastępuje JSON.

## Techniczne sprawdzenie

Zmiana terminu z 18:00 na 17:00 dla zapisanych ankiet: `0015_emperor_poll_deadline_17.sql`.

Migracja: `0014_emperor_polls.sql`. Jedno atomowe D1 `batch()` tworzy ankietę
i kandydatów z danych aktualnych w momencie zapisu. Unikalność dnia i głosu
wymusza baza. Zapis głosu jednym SQL-em ponownie sprawdza bieżącą sesję,
powiązanie, aktywność gracza, kandydata i deadline. Nie zapisuje punktacji rozgrywek.

`npm run test:polls` uruchamia rzeczywiste, izolowane D1 w pamięci i sprawdza
konkurencję, snapshot, powiązanie, kasowanie konta i deadline. Test jest częścią CI.
Testy Jest obejmują m.in. przejścia czasu letniego i zimowego oraz dokładny moment
środy o 17:00. Odświeżanie jest ograniczone do otwartego okna (co 30 sekund)
oraz otwarcia okna i zmian głosu.

Migracje zdalne wykonuje pipeline wdrożenia. Samo wdrożenie ankiet nie nadaje
uprawnień hosta i nie migruje głosów z historycznych JSON-ów.
