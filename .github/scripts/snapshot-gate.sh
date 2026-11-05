#!/usr/bin/env bash
# Bramka dla db-snapshot.yml. Wypisuje "go=true" albo "go=false" (do $GITHUB_OUTPUT).
#
# GitHub cron liczy w UTC, więc workflow ma dwa wpisy, każdy z osobnym stringiem `schedule`:
#   "20 2 * * 4"  to 04:20 w Warszawie latem (CEST, UTC+2)
#   "20 3 * * 4"  to 04:20 w Warszawie zimą (CET, UTC+1)
# Bieg wybieramy po wpisie cron i po bieżącym przesunięciu Warszawy względem UTC, a nie po
# godzinie zegara. Dzięki temu w każdy czwartek przechodzi dokładnie jeden wpis, także gdy GitHub
# uruchomi go z dużym opóźnieniem. Zmiana czasu wypada w niedzielę, więc czwartek jej nie dotyczy.
#
# Ręczne uruchomienie (workflow_dispatch) przechodzi zawsze.
#
# Zmienne: EVENT_NAME, EVENT_SCHEDULE (github.event.schedule), SNAPSHOT_NOW (tylko do testów:
# dowolny czas, który rozumie `date -d`).
set -euo pipefail

event="${EVENT_NAME:-}"
schedule="${EVENT_SCHEDULE:-}"
now="${SNAPSHOT_NOW:-now}"

if [ "$event" = "workflow_dispatch" ]; then
  echo "go=true"
  exit 0
fi

offset="$(TZ=Europe/Warsaw date -d "$now" +%z)"

case "$schedule:$offset" in
  "20 2 * * 4:+0200") echo "go=true" ;;   # lato, wpis 02:20 UTC
  "20 3 * * 4:+0100") echo "go=true" ;;   # zima, wpis 03:20 UTC
  *) echo "go=false" ;;
esac
