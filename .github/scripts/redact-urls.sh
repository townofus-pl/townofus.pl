#!/usr/bin/env bash
# Czyta stdin, pisze na stdout, każdy adres http(s) zamienia na "<url removed>".
# Repo jest publiczne, a `wrangler d1 export` wypisuje podpisany adres do pobrania zrzutu
# produkcji (ważny godzinę). Każde wyjście, które może zawierać adres, przechodzi przez ten filtr.
set -euo pipefail
sed -E "s#https?://[^[:space:]\"']+#<url removed>#g"
