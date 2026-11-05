# Wspólny draft ustawień

Hostowie edytują jeden wspólny draft w kreatorze w zakładce Ustawienia.
Otwarcie kreatora wczytuje draft, a gdy go jeszcze nie ma — aktualny zestaw.
Pierwsza poprawna zmiana tworzy pełną kopię zestawu jako `versionType = 'draft'`
w `drama_afera_settings`. Kolejne zmiany aktualizują ten sam rekord po 1200 ms
bezczynności. Niepoprawne wartości blokują zapis i są oznaczone w edytorze.
Zapisane dane są dostępne po odświeżeniu i dla innych hostów.

`current` i `old` pozostają niezależne. Wgranie nowego aktualnego zestawu nie
usuwa istniejącego draftu. Import .cfg w kreatorze zastępuje wspólny draft po
potwierdzeniu. Pobranie .cfg eksportuje zawartość edytora; samo nie publikuje ustawień.
„Cofnij wszystkie zmiany” przywraca zestaw wczytany przy ostatnim otwarciu lub
ponownym wczytaniu kreatora i również zapisuje to w drafcie.

## Kolejne miejsca edycji

Warstwa serwerowa: `getSettingsDraft()` i `saveSettingsDraft(content, token)`
w `_services/settings`. Klient korzysta z autoryzowanych server actions
`getSettingsDraftAction()` i `saveSettingsDraftAction()`.
Odczyt zwraca pełny plik, informację o istnieniu draftu i token wersji.
Zapis wymaga tokenu otrzymanego z ostatniego odczytu lub zapisu. Jedna atomowa
instrukcja SQL tworzy lub aktualizuje draft wyłącznie dla tej wersji.
Przy konflikcie edytor zachowuje lokalne zmiany i zgłasza błąd. Host może pobrać
je do .cfg i ponownie wczytać wspólny draft. Żaden edytor nie powinien omijać
tej kontroli ani automatycznie ponawiać zapisu ze świeżym tokenem bez uzgodnienia zmian.

Przycisk „Wgraj draft” przy zwykłym uploadzie publikuje ostatni zapisany draft
z rotacją current → old. W opcjach zaawansowanych zastępuje wybrany wariant
current lub old bez rotacji. Obie operacje wymagają autoryzacji hosta i nie
usuwają draftu. Należy poczekać na zapis zmian w kreatorze przed wgraniem draftu.

W panelu „Prawdopodobieństwo wystąpień” przycisk „Zastosuj w drafcie ustawień”
aktualizuje wyłącznie szanse ról we wspólnym drafcie. Wagi oblicza serwer dla
aktualnego sezonu. Role z Num = 0 pozostają wyłączone. Pozostała zawartość
draftu jest zachowana, a zapis korzysta z tej samej kontroli wersji co kreator.
Bezpośrednia edycja pliku pozostaje w domyślnie zwiniętej sekcji awaryjnej.

Migracja `0015_settings_draft.sql` dodaje `revision` z wartością domyślną 0.
Istniejący częściowy indeks unikalny zapewnia jeden aktywny rekord na wariant.
Odczyty publicznych ustawień nadal zwracają wyłącznie `current` i `old`.
