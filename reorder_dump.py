#!/usr/bin/env python3
"""
reorder_dump.py
---------------
Reorganises dump.sql so that INSERT statements appear in FK-safe order.

FK dependency graph (child → parent):
  game_player_statistics  → games, players
  player_roles            → game_player_statistics
  player_modifiers        → game_player_statistics
  game_events             → games, players
  meetings                → games
  meeting_skip_votes      → meetings, players
  meeting_blackmailed_players → meetings, players
  meeting_jailed_players  → meetings, players
  meeting_votes           → meetings, players
  player_rankings         → players, games

Circular FK:
  players.currentRankingId → player_rankings.id
  player_rankings.playerId → players.id

Resolution:
  1. Insert players with currentRankingId = NULL
  2. Insert all other tables in correct order
  3. After player_rankings, emit UPDATE players SET currentRankingId = X WHERE id = Y
  4. Wrap everything in BEGIN/COMMIT with PRAGMA defer_foreign_keys=TRUE
     (SQLite only checks FKs at COMMIT time inside a transaction)

Usage:
  python reorder_dump.py [input] [output]

Defaults:
  input  = dump.sql
  output = dump_reordered.sql
"""

import re
import sys

INPUT  = sys.argv[1] if len(sys.argv) > 1 else "dump.sql"
OUTPUT = sys.argv[2] if len(sys.argv) > 2 else "dump_reordered.sql"

# Desired FK-safe emission order (tables that appear in the dump)
TABLE_ORDER = [
    "players",
    "games",
    "game_player_statistics",
    "player_roles",
    "player_modifiers",
    "game_events",
    "meetings",
    "meeting_skip_votes",
    "meeting_blackmailed_players",
    "meeting_jailed_players",
    "meeting_votes",
    "player_rankings",
    # sqlite_sequence is handled last, separately
]

# Regex to identify INSERT lines and capture the table name
INSERT_RE = re.compile(r'^INSERT INTO "([^"]+)"')

# Regex to capture the column list from a players INSERT
# e.g. INSERT INTO "players" ("id","name","createdAt","updatedAt","currentRankingId","deletedAt")
PLAYERS_COLS_RE = re.compile(r'^INSERT INTO "players" \(([^)]+)\)')

def parse_columns(col_string):
    """Parse '"col1","col2",...' → ['col1', 'col2', ...]"""
    return [c.strip().strip('"') for c in col_string.split(',')]

def nullify_current_ranking(line):
    """
    Given a players INSERT line, set currentRankingId to NULL and return
    (modified_line, player_id, original_ranking_id).
    If currentRankingId is already NULL returns (line, player_id, None).
    """
    m = PLAYERS_COLS_RE.match(line)
    if not m:
        raise ValueError(f"Cannot parse players INSERT: {line[:120]}")

    cols = parse_columns(m.group(1))

    # Find the VALUES(...) portion — everything after the column list paren
    # Line format: INSERT INTO "players" (cols) VALUES(vals);
    vals_start = line.index(' VALUES(') + len(' VALUES(')
    vals_str = line[vals_start:-2]  # strip trailing ");\n" → leaves "val1,val2,...)"
    vals_str = vals_str.rstrip(')')  # strip the closing paren of VALUES(...)

    # Parse values — respect quoted strings (no embedded parens/quotes in this data)
    # Use a simple state machine: handle single-quoted strings and NULL/numbers
    values = []
    buf = []
    in_quote = False
    for ch in vals_str:
        if ch == "'" and not in_quote:
            in_quote = True
            buf.append(ch)
        elif ch == "'" and in_quote:
            in_quote = False
            buf.append(ch)
        elif ch == ',' and not in_quote:
            values.append(''.join(buf))
            buf = []
        else:
            buf.append(ch)
    if buf:
        values.append(''.join(buf))

    assert len(cols) == len(values), (
        f"Column/value count mismatch: {len(cols)} cols vs {len(values)} values\n{line[:200]}"
    )

    idx_id               = cols.index('id')
    idx_current_ranking  = cols.index('currentRankingId')

    player_id        = int(values[idx_id])
    ranking_id_raw   = values[idx_current_ranking].strip()
    original_ranking = None if ranking_id_raw == 'NULL' else int(ranking_id_raw)

    if original_ranking is not None:
        values[idx_current_ranking] = 'NULL'

    # Reconstruct line
    new_vals = ','.join(values)
    prefix   = line[:vals_start]            # everything up to and including VALUES(
    new_line = f"{prefix}{new_vals});\n"

    return new_line, player_id, original_ranking


def main():
    print(f"Reading {INPUT} ...")

    # Buckets: table_name → list of lines
    buckets = {t: [] for t in TABLE_ORDER}
    buckets["sqlite_sequence"] = []
    other_lines = []  # pragmas, comments, blanks

    # Circular FK bookkeeping: player_id → original currentRankingId
    current_ranking_updates = {}

    with open(INPUT, 'r', encoding='utf-8') as f:
        for lineno, raw_line in enumerate(f, 1):
            line = raw_line  # preserve original newline

            m = INSERT_RE.match(line)
            if not m:
                # Not an INSERT — keep for reference but don't emit (pragmas etc.)
                other_lines.append(line)
                continue

            table = m.group(1)

            if table == "players":
                modified, pid, orig_rid = nullify_current_ranking(line)
                buckets["players"].append(modified)
                if orig_rid is not None:
                    current_ranking_updates[pid] = orig_rid
            elif table in buckets:
                buckets[table].append(line)
            else:
                # Unknown table — append as-is to other_lines so nothing is lost
                print(f"  WARNING: unknown table '{table}' at line {lineno}, keeping as-is")
                other_lines.append(line)

            if lineno % 10000 == 0:
                print(f"  ... processed {lineno} lines")

    print(f"  Done reading. Writing {OUTPUT} ...")

    with open(OUTPUT, 'w', encoding='utf-8') as out:
        # D1 does not support BEGIN/COMMIT or PRAGMA in SQL scripts.
        # FK safety is guaranteed purely by insertion order.

        for table in TABLE_ORDER:
            rows = buckets[table]
            if not rows:
                continue
            out.write(f"-- {table} ({len(rows)} rows)\n")
            for row in rows:
                out.write(row)
            out.write("\n")

            # After player_rankings, emit the circular-FK UPDATE statements
            if table == "player_rankings" and current_ranking_updates:
                out.write(f"-- Restore players.currentRankingId ({len(current_ranking_updates)} rows)\n")
                for pid, rid in sorted(current_ranking_updates.items()):
                    out.write(
                        f'UPDATE "players" SET "currentRankingId" = {rid} WHERE "id" = {pid};\n'
                    )
                out.write("\n")

        # sqlite_sequence last
        seq_rows = buckets["sqlite_sequence"]
        if seq_rows:
            out.write(f"-- sqlite_sequence ({len(seq_rows)} rows)\n")
            for row in seq_rows:
                out.write(row)
            out.write("\n")

        out.write("\n")

    # Stats
    print("\nRow counts per table:")
    total = 0
    for table in TABLE_ORDER + ["sqlite_sequence"]:
        count = len(buckets[table])
        total += count
        print(f"  {table:<35} {count:>6}")
    print(f"  {'TOTAL':<35} {total:>6}")
    print(f"\nCurrentRankingId UPDATEs to emit: {len(current_ranking_updates)}")
    print(f"\nOutput written to: {OUTPUT}")


if __name__ == "__main__":
    main()
