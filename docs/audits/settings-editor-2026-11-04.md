# Test edytora ustawień — 4 listopada 2026

Testy wykonano lokalnie na branchu `nowosci`. Pliki wejściowe użytkownika pozostały niezmienione. Testy na stronie modyfikowały wyłącznie lokalny draft; jego oryginalną zawartość przywrócono i porównano dokładnie z kopią. Rewizja draftu została zwiększona, aby odrzucać zapisy ze starych kart. Nie wgrywano ustawień jako current/old ani nie zapisywano przeglądów balansu.

## Pliki i metoda

Wejście: ASASAS.cfg, Default.cfg, DRAMAAFERA.cfg, DRAMAAFERA2.cfg, mira.cfg, mira_old.cfg, mira2.cfg, mira3.cfg, MIRA7.cfg, MIRA7-wlasne.cfg, PUSTE.cfg. Łącznie 11 871 wpisów w 11 plikach; od 1047 do 1130 wpisów w pojedynczym pliku.

Automatyczny test korzysta z rzeczywistych parsera, walidatora, eksportera i metadanych kontrolek aplikacji. Dla każdego pliku sprawdza import, walidację i eksport bez zmian. Dla wszystkich 110 uporządkowanych par plików próbuje zastosować wartości docelowe do istniejących kluczy źródła (łącznie 24 394 zmiany), sprawdza możliwość wybrania ich przez kontrolki oraz porównuje wynikowe wartości po eksporcie. To test logiki i dostępności wartości w kontrolkach, a nie 110 pełnych scenariuszy klikania w przeglądarce.

Powtarzalny skrypt i szczegółowe dane znajdują się lokalnie w `local-only-changes/settings-audit/`: `audit.ts`, `results-before.json`, `results.json` i `ui-results.json`. Skrypt czyta pliki z oryginalnej lokalizacji użytkownika. Nie zawarto kopii jego presetów w kodzie ani w tym raporcie.

## Znalezione i poprawione problemy

1. Engineer → Tasks Required For Additional Fix Use (`FixPerTasks`) miał listę tylko z „Off”, blokującą wartość 3 z przykładów.
2. Time Lord → Tasks Required for Additional Rewind Use (`UsesPerTasks`) miał ten sam problem. Łącznie problem list dotyczył 31 kierunków porównań.
3. ASASAS.cfg zawiera Hunter → Initial Stalks Uses (`StalkUses`) = -1. Walidacja tego wyjątku wcześniej nie dopuszczała, blokując 10 kierunków eksportu do ASASAS.cfg.

Po dodatkowej instrukcji użytkownika opcje liczbowe z „Off” są polami liczbowymi, pokazującymi „Off” dla wartości specjalnej. `StalkUses` dołączono do dokładnej listy wyjątków dopuszczających -1, wyświetlane jako -1. Pozostałe liczby ujemne nadal są odrzucane. Dodano/zmieniono testy regresji dla tych zachowań.

## Wynik automatyczny po poprawkach

- 11/11 plików przechodzi import i walidację.
- 11/11 eksportów bez zmian zachowuje cały tekst dokładnie, włącznie z końcami linii.
- 110/110 porównań nie zgłasza błędu eksportu ani różnicy wartości na wspólnych kluczach.
- Żadna z wartości docelowych dla widocznych, istniejących ustawień nie jest już blokowana przez listę wyboru.
- Pełny zestaw Jest: 44 zestawy, 383 testy zakończone powodzeniem. Kontrola TypeScript zakończona powodzeniem.

## Sprawdzenie na działającej stronie

- Import MIRA7.cfg w kreatorze, zmiana Lookout → Watch Cooldown z 7 na 7.5, automatyczny zapis i ponowne wczytanie draftu. Zapisany plik jest dokładnie identyczny z MIRA7-wlasne.cfg: 94 130 bajtów, identyczne końce linii.
- Engineer i Time Lord: przejścia Off → 3 → Off w polu liczbowym.
- Hunter → Initial Stalks Uses: wpisanie -1, widoczny zapis -1 i wyłączony przycisk dalszego zmniejszania. Wpisanie -2 daje błąd i blokuje pobranie, nie zapisuje niepoprawnej wartości.
- Checkbox Ambassador → Retrain Requires Confirmation: zmiana i cofnięcie wartości.
- Hunter → Stalks Triggered By: wybór All Abilities, odpowiadający wartości 0 z Default.cfg.
- Arsonist → Douses Possible at Once: widoczny symbol ∞ dla 0 i przejście do liczby 5.
- Odczyt lokalnej bazy potwierdził 7/7 oczekiwanych wartości końcowych, w tym wartości po cofnięciu testowych zmian i wartości pozostawionych do sprawdzenia zapisu.

## Granice zgodności i testu

- 90 ze 110 par ma różne zestawy kluczy (np. pola przeniesione do innych sekcji, nowe role i opcje). Edytor zachowuje strukturę pliku bazowego; zmiana wartości nie dodaje brakujących kluczy i nie usuwa nadmiarowych. Nie można traktować zgodności wartości wspólnych pól jako identyczności całych takich plików.
- Hide & Seek jest celowo ukryte w edytorze. W 36 parach występują różnice takich pól. Spośród 20 par z identycznym zestawem kluczy 16 nie ma różnic ukrytych pól i może zostać odtworzonych przez widoczne kontrolki.
- Wpisanie zera wiodącego może zachować zapis np. 05, wyświetlany po utracie fokusu jako 5. To ta sama wartość liczbowa, ale inny tekst pliku. Po wpisaniu dokładnego 5 sprawdzono również dokładny zapis 5.
- Kliknięcie „Pobierz .cfg” pokazało komunikat przygotowania pliku, lecz narzędzie przeglądarki nie otrzymało zdarzenia pobrania. Nie potwierdzono pliku pobranego na dysk. Dokładne porównanie MIRA7 wykonano na zawartości zapisanej w D1; eksport bez zmian i wszystkie transformacje sprawdzono niezależnie przez rzeczywistą funkcję eksportera.
