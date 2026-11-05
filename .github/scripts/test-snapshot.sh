#!/usr/bin/env bash
# Testy dla db-snapshot.yml: filtr adresów i kształt workflow.
# Uruchom z korzenia repo, na systemie z GNU sed i python3-yaml (ubuntu, albo kontener docker):
#   bash .github/scripts/test-snapshot.sh
set -uo pipefail
fail=0
redact=.github/scripts/redact-urls.sh
wf=.github/workflows/db-snapshot.yml

check() { # opis, oczekiwane, dostane
  if [ "$2" = "$3" ]; then echo "ok    $1"; else echo "FAIL  $1 (want '$2', got '$3')"; fail=1; fi
}
# Zwraca "clean", jeśli w wyniku filtra nie ma żadnego z podanych fragmentów.
leaks() { # wynik, fragment...
  local out="$1"; shift
  for needle in "$@"; do
    case "$out" in *"$needle"*) echo "leak:$needle"; return ;; esac
  done
  echo clean
}

# --- filtr adresów: znane kształty ---
sample='You can also download your export from the following URL manually. This link will be valid for one hour: https://abc123.r2.cloudflarestorage.com/d1-sqlio-outgoing-prod/9c5d.sql?X-Amz-Credential=KEYID%2F20261105&X-Amz-Signature=deadbeef'
out="$(printf '%s\nplain line\n' "$sample" | $redact)"
check "signed URL line removed"        clean "$(leaks "$out" X-Amz deadbeef https:// cloudflarestorage)"
check "next normal line kept"          1 "$(printf '%s\n' "$out" | grep -c '^plain line$')"

out="$(printf 'Could not connect to "https://x.r2.cloudflarestorage.com/b/k" now\n' | $redact)"
check "URL in quotes removed"          clean "$(leaks "$out" https:// cloudflarestorage)"
check "text around the URL kept"       'Could not connect to "<url removed>" now' "$out"

# --- filtr adresów: kształty, których wcześniej nie znał ---
out="$(printf 'download: abc123.r2.cloudflarestorage.com/d1-sqlio-outgoing-prod/9c5d.sql\n' | $redact)"
check "URL with no scheme"             clean "$(leaks "$out" cloudflarestorage d1-sqlio)"

out="$(printf 'open HTTPS://ABC123.R2.CLOUDFLARESTORAGE.COM/d1-sqlio-outgoing-prod/9c5d.sql now\n' | $redact)"
check "HTTPS:// in capitals"           clean "$(leaks "$out" HTTPS:// CLOUDFLARESTORAGE d1-sqlio)"

out="$(printf '{"url":"https:\\/\\/abc123.r2.cloudflarestorage.com\\/d1-sqlio-outgoing-prod\\/9c5d.sql"}\n' | $redact)"
check "JSON form https:\\/\\/"         clean "$(leaks "$out" cloudflarestorage d1-sqlio 'https:')"

# URL zawinięty w połowie: pierwsza linia kończy się na ścieżce, druga zaczyna się od parametru
# podpisu, trzecia to sam ogon podpisu (64 znaki hex).
tail64=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
out="$(printf 'valid for one hour: https://abc123.r2.cloudflarestorage.com/d1-sqlio-outgoing-prod/9c5d.sql?\nX-Amz-Signature=\n%s\nplain line\n' "$tail64" | $redact)"
check "URL after a line break: no signature" clean "$(leaks "$out" "$tail64" X-Amz https:// cloudflarestorage)"
check "URL after a line break: next line kept" 1 "$(printf '%s\n' "$out" | grep -c '^plain line$')"

# ogon podpisu bez żadnej linii z x-amz-
out="$(printf 'tail of the URL:\n%s\n' "$tail64" | $redact)"
check "bare signature tail"            clean "$(leaks "$out" "$tail64")"

# x-amz- w dowolnej wielkości liter usuwa całą linię
for form in x-amz-signature X-AMZ-SIGNATURE X-Amz-Signature x-AmZ-sIgNaTuRe; do
  out="$(printf 'before\nsome text %s=abc and more\nafter\n' "$form" | $redact)"
  check "x-amz- line deleted ($form)"  'before
after' "$out"
done

# --- filtr adresów: zwykłe linie błędów zostają ---
errors=(
  '✘ [ERROR] A request to the Cloudflare API (/accounts/d1287f321cc95882fc773ab71241b51a/d1/database/9c5d9f5d-957f-4472-9430-80b551fe6419/query) failed.'
  '✘ [ERROR] no such table: main.player_rankings: SQLITE_ERROR'
  'Authentication error [code: 10000]'
  'Logs were written to "/home/runner/.config/.wrangler/logs/wrangler-2026-11-05_01-46-05_824.log"'
  'npm error code E404'
)
for line in "${errors[@]}"; do
  check "normal error line kept: ${line:0:40}" "$line" "$(printf '%s\n' "$line" | $redact)"
done

# --- workflow ---
python3 - "$wf" <<'PY'
import sys, yaml
d = yaml.safe_load(open(sys.argv[1]))
on = d.get('on', d.get(True))
sched = on['schedule']
assert sched == [{'cron': '20 4 * * 4', 'timezone': 'Europe/Warsaw'}], sched
assert 'workflow_dispatch' in on
job = d['jobs']['snapshot']
assert job['environment'] == 'production'
assert job['steps'][0]['name'] == 'Production only from main'
assert job['steps'][0]['if'] == "github.ref != 'refs/heads/main'"
PY
check "workflow parses; schedule has timezone Europe/Warsaw; main check is the first step" 0 "$?"
check "no gate left in the workflow"            0 "$(grep -ci 'gate' $wf)"
check "no gate script left"                     0 "$(ls .github/scripts | grep -ci 'gate')"
check "no step condition on a gate output"      0 "$(grep -c 'steps\.' $wf)"
check "export output goes to a file"            1 "$(grep -c 'd1 export .*> "\$log" 2>&1' $wf)"
check "export log is printed only through the filter" 1 "$(grep -c 'redact-urls.sh < "\$log"' $wf)"
check "every aws call is piped through the filter" 0 "$(grep 'aws s3' $wf | grep -vc 'redact-urls.sh')"
check "no artifact upload"                      0 "$(grep -c 'upload-artifact' $wf)"

exit $fail
