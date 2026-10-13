# Zapisy na środę

`/dramaafera/zapisy` pokazuje publiczną Listę Cweli na najbliższą sesję.
Zapisać lub wypisać siebie może tylko aktywna sesja Discord z zatwierdzonym
powiązaniem do aktywnego `Player.id`. Nick pochodzi z bazy, nigdy z żądania klienta.
Host może ręcznie edytować tę samą listę w panelu.

## Termin i reset

Środa pozostaje bieżącą sesją do 22:00 w `Europe/Warsaw`. Dokładnie o 22:00
otwierają się zapisy na kolejną środę. Obliczenia uwzględniają zmianę czasu i sezon
daty docelowej. Nie potrzeba zadania cron: każdy odczyt i zapis wyznacza aktualny
termin, a otwarte strony mają timer oraz odświeżanie co 30 sekund.

Reset oznacza przełączenie na osobny rekord kolejnego tygodnia. Poprzednie listy
pozostają w bazie; panel hosta nie udostępnia ich wyboru ani zmiany daty.
Strony wyników (również sezonowe) pokazują wyłącznie rozgrywki, bez Listy Cweli.
Pierwsza gra nie usuwa już listy; na stronie zapisów i w panelu hosta pozostaje
ona dostępna do 22:00.

## Współbieżność i uprawnienia

Istniejące `lista_cweli.playerNames` pozostaje wspólnym źródłem danych.
Dopisanie i wypisanie jest pojedynczym poleceniem SQL na aktualnej tablicy JSON;
równoczesne zapisy nie nadpisują się i nie tworzą duplikatów.
SQL ponownie sprawdza sesję, powiązanie, soft-delete i rzeczywisty termin zamknięcia.
Mutacje wymagają zgodnego Origin.

Host zapisuje z porównaniem oryginalnego JSON-a. Jeśli ktoś zmienił listę podczas
edycji, host dostaje komunikat o konflikcie i musi odświeżyć listę.
Discord host jest ponownie weryfikowany w SQL; Basic Auth jest sprawdzany przez
akcję serwerową. Stary formularz nie może zapisać poprzedniej środy po resecie.

## Sprawdzenie

`npm test` obejmuje granicę 22:00, oba przejścia DST i zabezpieczenia endpointu.
`npm run test:signups` sprawdza rzeczywiste D1: równoczesne zapisy, wypisywanie,
konflikt formularza hosta, wygasłe sesje, zmianę powiązania, odebranie roli hosta
i odrzucenie żądań po terminie. Test działa w izolowanej bazie, bez danych strony.
