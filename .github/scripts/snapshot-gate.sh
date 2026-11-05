#!/usr/bin/env bash
# Bramka czasu dla db-snapshot.yml. Wypisuje "go=true" albo "go=false" (do $GITHUB_OUTPUT).
#
# GitHub cron liczy w UTC, więc workflow ma dwa wpisy: 02:20 i 03:20 UTC. Tylko jeden z nich
# wypada o 04:xx w Warszawie (latem 02:20 UTC, zimą 03:20 UTC). Ta bramka przepuszcza ten jeden.
# Ręczne uruchomienie (workflow_dispatch) przechodzi zawsze.
#
# GitHub potrafi opóźnić zaplanowany bieg, więc sprawdzamy całą godzinę 04:xx, nie minutę 20.
#
# Zmienne: EVENT_NAME (nazwa zdarzenia GitHub), SNAPSHOT_NOW (opcjonalnie, tylko do testów:
# dowolny czas, który rozumie `date -d`).
set -euo pipefail

event="${EVENT_NAME:-}"
now="${SNAPSHOT_NOW:-now}"

if [ "$event" = "workflow_dispatch" ]; then
  echo "go=true"
  exit 0
fi

# %u: 1..7, czwartek = 4. %H: godzina 00..23. Obie wartości w strefie Warszawy.
dow="$(TZ=Europe/Warsaw date -d "$now" +%u)"
hour="$(TZ=Europe/Warsaw date -d "$now" +%H)"

if [ "$dow" = "4" ] && [ "$hour" = "04" ]; then
  echo "go=true"
else
  echo "go=false"
fi
