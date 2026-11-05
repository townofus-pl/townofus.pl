#!/usr/bin/env bash
# Czyta stdin, pisze na stdout, usuwa z tekstu wszystko, co może być adresem do pobrania zrzutu.
# Repo jest publiczne, a `wrangler d1 export` wypisuje podpisany adres zrzutu produkcji (ważny
# godzinę). Każde wyjście, które może zawierać adres, przechodzi przez ten filtr.
#
# Filtr zna kilka kształtów adresu, ale nie może znać wszystkich. Dlatego działa warstwowo:
#   1. Cała linia z `x-amz-` (w dowolnej wielkości liter) znika. Tak zaczyna się każdy parametr
#      podpisu, także gdy zawinięcie linii odcięło początek adresu.
#   2. Adres ze schematem (http, https, w dowolnej wielkości liter, także `https:\/\/` z JSON-a)
#      zamienia się na "<url removed>".
#   3. Adres bez schematu na hoście `*.cloudflarestorage.com` też.
#   4. Długi ciąg znaków bez spacji, ukośników i kropek (40 lub więcej znaków liter, cyfr, `%`, `_`, `-`),
#      czyli typowy ogon podpisu po zawinięciu linii, zamienia się na "<long token removed>".
#      Ścieżki, jak /accounts/<id>/d1/database/<uuid>, mają ukośniki, więc zostają.
# Wymaga GNU sed (flaga I). Runner ubuntu go ma.
set -euo pipefail
sed -E \
  -e '/x-amz-/Id' \
  -e 's#https?:(\\?/){2}[^[:space:]"'"'"']+#<url removed>#Ig' \
  -e 's#[A-Za-z0-9.-]+\.cloudflarestorage\.com[^[:space:]"'"'"']*#<url removed>#Ig' \
  -e 's#[A-Za-z0-9%_-]{40,}#<long token removed>#g'
