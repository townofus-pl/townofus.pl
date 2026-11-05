#!/usr/bin/env bash
# Testy dla db-snapshot.yml: bramka czasu, filtr adresów i zachowanie kroku bramki przy błędzie.
# Uruchom z korzenia repo, na systemie z GNU date i tzdata (ubuntu, albo kontener docker):
#   bash .github/scripts/test-snapshot.sh
# Krok "gate step" czyta workflow przez python3 + PyYAML (na ubuntu: apt-get install python3-yaml).
set -uo pipefail
fail=0
gate=.github/scripts/snapshot-gate.sh
redact=.github/scripts/redact-urls.sh
wf=.github/workflows/db-snapshot.yml

check() { # opis, oczekiwane, dostane
  if [ "$2" = "$3" ]; then echo "ok    $1"; else echo "FAIL  $1 (want '$2', got '$3')"; fail=1; fi
}
g() { EVENT_NAME="$1" EVENT_SCHEDULE="$2" SNAPSHOT_NOW="$3" $gate; }

SUMMER='20 2 * * 4'; WINTER='20 3 * * 4'

# --- bramka: przypadki jawne ---
check "summer, 02:20 entry, on time"      go=true  "$(g schedule "$SUMMER" '2026-07-02 02:20 UTC')"
check "summer, 03:20 entry, on time"      go=false "$(g schedule "$WINTER" '2026-07-02 03:20 UTC')"
check "winter, 03:20 entry, on time"      go=true  "$(g schedule "$WINTER" '2026-12-03 03:20 UTC')"
check "winter, 02:20 entry, on time"      go=false "$(g schedule "$SUMMER" '2026-12-03 02:20 UTC')"
check "winter, 02:20 entry, 70 min late"  go=false "$(g schedule "$SUMMER" '2026-12-03 03:30 UTC')"
check "winter, 03:20 entry, 3 h late"     go=true  "$(g schedule "$WINTER" '2026-12-03 06:20 UTC')"
check "summer, 02:20 entry, 2 h late"     go=true  "$(g schedule "$SUMMER" '2026-07-02 04:20 UTC')"
check "summer, 03:20 entry, 2 h late"     go=false "$(g schedule "$WINTER" '2026-07-02 05:20 UTC')"
check "week before spring change (CET)"   go=true  "$(g schedule "$WINTER" '2026-03-26 03:20 UTC')"
check "week before spring change, other"  go=false "$(g schedule "$SUMMER" '2026-03-26 02:20 UTC')"
check "week after spring change (CEST)"   go=true  "$(g schedule "$SUMMER" '2026-04-02 02:20 UTC')"
check "week after spring change, other"   go=false "$(g schedule "$WINTER" '2026-04-02 03:20 UTC')"
check "week after autumn change (CET)"    go=true  "$(g schedule "$WINTER" '2026-10-29 03:20 UTC')"
check "week after autumn change, other"   go=false "$(g schedule "$SUMMER" '2026-10-29 02:20 UTC')"
check "week before autumn change (CEST)"  go=true  "$(g schedule "$SUMMER" '2026-10-22 02:20 UTC')"
check "unknown schedule string"           go=false "$(g schedule '0 0 * * *' '2026-07-02 02:20 UTC')"
check "empty schedule on schedule event"  go=false "$(g schedule '' '2026-07-02 02:20 UTC')"
check "manual run, summer"                go=true  "$(g workflow_dispatch '' '2026-07-01 12:00 UTC')"
check "manual run, winter, late night"    go=true  "$(g workflow_dispatch '' '2026-12-05 23:59 UTC')"

# --- bramka: dokładnie jeden wpis na każdy czwartek 2026, przy opóźnieniach 0 / 45 / 150 min ---
bad=0; total=0
for week in $(seq 0 52); do
  day="$(date -u -d "2026-01-01 +$week weeks" +%F)"
  dow="$(date -u -d "$day" +%u)"
  [ "$dow" -le 4 ] && day="$(date -u -d "$day +$((4 - dow)) days" +%F)" || day="$(date -u -d "$day +$((11 - dow)) days" +%F)"
  [ "$(date -u -d "$day" +%Y)" = 2026 ] || continue
  for delay in 0 45 150; do
    n=0
    for entry in "2 $SUMMER" "3 $WINTER"; do
      hour="${entry%% *}"; sched="${entry#* }"
      now="$(date -u -d "$day $hour:20 UTC +$delay minutes" '+%F %T UTC')"
      [ "$(g schedule "$sched" "$now")" = go=true ] && n=$((n + 1))
    done
    total=$((total + 1)); [ "$n" = 1 ] || { bad=$((bad + 1)); echo "  $day delay $delay min: $n entries continue"; }
  done
done
check "exactly one entry continues ($total Thursday/delay cases)" 0 "$bad"

# --- filtr adresów ---
sample='You can also download your export from the following URL manually. This link will be valid for one hour: https://abc123.r2.cloudflarestorage.com/d1-sqlio-outgoing-prod/9c5d.sql?X-Amz-Credential=KEYID%2F20261105&X-Amz-Signature=deadbeef'
out="$(printf '%s\nplain line\n' "$sample" | $redact)"
case "$out" in *X-Amz*|*deadbeef*|*https://*|*cloudflarestorage*) r=leak ;; *) r=clean ;; esac
check "redact: signed URL removed"          clean "$r"
check "redact: other text kept"             1 "$(printf '%s\n' "$out" | grep -c '^plain line$')"
check "redact: sentence kept"               1 "$(printf '%s\n' "$out" | grep -c 'valid for one hour: <url removed>')"
out="$(printf 'upload failed: s3://bucket/key to Could not connect to the endpoint URL: "https://x.r2.cloudflarestorage.com/b/k?X-Amz-Signature=zz"\n' | $redact)"
case "$out" in *X-Amz*|*https://*) r=leak ;; *) r=clean ;; esac
check "redact: URL in quotes removed"       clean "$r"

# --- workflow: wyjście eksportu i aws nie trafia do logu bez filtra ---
check "export output goes to a file" 1 "$(grep -c 'd1 export .*> "\$log" 2>&1' $wf)"
check "export log is printed only through the filter" 1 "$(grep -c 'redact-urls.sh < "\$log"' $wf)"
check "every aws call is piped through the filter" 0 "$(grep 'aws s3' $wf | grep -vc 'redact-urls.sh')"
check "no artifact upload" 0 "$(grep -c 'upload-artifact' $wf)"

# --- krok bramki: kod wyjścia 3 musi wywalić krok ---
tmp="$(mktemp -d)"; mkdir -p "$tmp/.github/scripts"
printf '#!/usr/bin/env bash\necho go=true\nexit 3\n' > "$tmp/.github/scripts/snapshot-gate.sh"; chmod +x "$tmp/.github/scripts/snapshot-gate.sh"
python3 - "$wf" "$tmp/step.sh" <<'PY'
import sys, yaml
steps = yaml.safe_load(open(sys.argv[1]))['jobs']['snapshot']['steps']
step = next(s for s in steps if s.get('id') == 'gate')
assert step.get('shell') == 'bash', 'gate step has no shell: bash'
open(sys.argv[2], 'w').write(step['run'])
PY
# GitHub uruchamia `shell: bash` jako: bash --noprofile --norc -eo pipefail {0}
( cd "$tmp" && GITHUB_OUTPUT="$tmp/out" bash --noprofile --norc -eo pipefail step.sh >/dev/null 2>&1 ); rc=$?
check "gate that exits 3 fails the step" 3 "$rc"
printf '#!/usr/bin/env bash\necho go=true\n' > "$tmp/.github/scripts/snapshot-gate.sh"
rm -f "$tmp/out"
( cd "$tmp" && GITHUB_OUTPUT="$tmp/out" bash --noprofile --norc -eo pipefail step.sh >/dev/null 2>&1 ); rc=$?
check "gate that exits 0 passes the step" 0 "$rc"
check "gate output reaches GITHUB_OUTPUT" go=true "$(cat "$tmp/out")"
rm -rf "$tmp"

exit $fail
