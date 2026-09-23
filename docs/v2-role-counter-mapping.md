# v2 ingest: action → counter mapping

Resolution artifact for [#295](https://github.com/townofus-pl/townofus.pl/issues/295). This is the
spec `api/v2/games/_utils/aggregate.ts` implements.

Verified against `dramaafera-stats-mod` at `2e751b7`, the build serving production since
2026-09-23. Re-verify when the mod's `game_data.schema.json` or its correctness rules move; a
new (type, role) pair rejects the upload, which is the signal this table is behind.

## Ground rules

1. **The mod scores, the server sums.** `totalPoints` = Σ every action's `pointsChange`, full stop.
   No win bonus is added (the `win` action already carries it) and the disconnect clamp arrives
   already applied. Counters are for display only — the ranking reads `totalPoints` alone.
2. **The counter set is frozen at 24.** New statistics are queried from `game_actions`, not added
   as columns. Empirically justified: of the 24, five carry almost all signal and everything below
   `correctGuesses` fires in under 6 % of 11,374 real rows; `incorrectDeputyShoots` has fired once.
3. **`correctMedicShields`/`incorrectMedicShields` are renamed to `correctProtects`/`incorrectProtects`.**
   They already collect Mercenary (Neutral) and Monarch (Crewmate), so the Medic-specific name was
   wrong.
4. **An unexpected (type, role) pair rejects the upload**, same as an unknown role. TOU-Mira is
   never auto-updated, so a new ability can only appear through a deliberate version bump — a
   rejection is the signal that this table needs updating, not a random failure.

## Counter rules by action type

`isCorrect` is three-valued: `true` → the `correct*` counter, `false` → the `incorrect*` counter,
`null` → **neither** (the mod could not classify; it scores nothing and is not the actor's failure).
On `swap` the field may be **absent**, which means the rule declined to score — also neither.

| Action type | Counter | Performer roles that may produce it |
|---|---|---|
| `kill` where `isGuess = true` | `correctGuesses` / `incorrectGuesses` | Vigilante, Doomsayer, any role carrying the Double Shot modifier |
| `kill` by Deputy | `correctDeputyShoots` / `incorrectDeputyShoots` | Deputy |
| `kill` by Jailor | `correctJailorExecutes` / `incorrectJailorExecutes` | Jailor |
| `kill` by Prosecutor | `correctProsecutes` / `incorrectProsecutes` | Prosecutor |
| `kill` (all other) | `correctKills` / `incorrectKills` | every Impostor role, Sheriff, Officer, Hunter, Veteran, Inquisitor, every Neutral Killing role, any role carrying Crewpostor |
| `protect` by Warden | `correctWardenFortifies` / `incorrectWardenFortifies` | Warden |
| `protect` (all other) | `correctProtects` / `incorrectProtects` | Medic, Mirrorcaster, Oracle |
| `knight` | `correctProtects` / `incorrectProtects` | Monarch |
| `revive` | `correctAltruistRevives` / `incorrectAltruistRevives` | Altruist, Time Lord |
| `swap` | `correctSwaps` / `incorrectSwaps` | Swapper |
| `janitor_clean` | `janitorCleans` (flat +1) | Janitor |
| `task_completed` | `completedTasks` (flat +1) | any role that started Crewmate-aligned |
| `round_survived` | `survivedRounds` (flat +1) | any living, still-connected player |
| `role_assigned` | `initialRolePoints` ← this action's `pointsChange` | every player, once |

### Types that map to no counter

Stored in `game_actions`, used for the timeline, and deliberately not aggregated:

`death` · `role_changed` · `vote` · `douse` · `infect` · `bite` · `modifier_gained` ·
`modifier_lost` · `time_rewind` · `body_reported` · `emergency_button` · `ability_used` ·
`vent_use` · `sabotage_started` · `sabotage_fixed` · `win` · `disconnect`

`win` and `disconnect` are read from `players[*].win` and `players[*].disconnected`, not from the
presence of their actions — the mod omits a `disconnect` action when the clamp delta is below its
epsilon, so absence does not mean the player stayed.

### Traps

- **`kill` vs `death`.** `kill` is a kill the player chose to make, **including a Sheriff misfire
  or a Vigilante misguess that kills the guesser themselves** (self-target, scored as incorrect). `death` is
  an unscored mechanical death. Bucketing `death` into a kill counter inflates it.
- **`round_survived` is not emitted for disconnected players**, so round counts do not sum evenly
  across a roster.
- **`sabotage_started`/`sabotage_fixed` include doors** — closing doors is a sabotage in the game's
  terms and the automatic reopen is its fix.
- **`ability_used` is an open vocabulary** — all 58 `AbilityType` values plus a synthetic
  `ChefServe`, plus whatever TOU-Mira adds next. Never enum-constrain it.
- **`pointsChange` is a C# `float`.** Expect `0.30000001`. Sum wide, round for display, never
  equality-compare.

## The role allow-list

**v1 games use `src/roles/` (60 legacy roles). v2 games use `src/mira/roles/` only.** The two
registries stay separate; there is no union.

`src/mira/roles/` was diffed against the submodule and is **an exact 1:1 match — 77 roles, none
missing, none extra**. As a custom-role allow-list it is already complete and current.

### How a role name resolves

All three gaps this section used to list are closed (`a6218d1`).

- **The registry is era-aware.** `getRoleIndex(season)` picks `src/roles/` (60 legacy) below
  `FIRST_MIRA_SEASON` and `src/mira/roles/` (77 Mira) at or above it. The era comes from the
  game's own season, never from the request.
- **Vanilla and ghost roles are in the index.** `CorrectnessChecker.GetRoleName` falls back to the
  Among Us `RoleTypes` enum for anything that is not an `ICustomRole`, so `Crewmate`, `Impostor`,
  `CrewmateGhost`, `ImpostorGhost` and the space-separated `Neutral Ghost` all resolve. Without
  them v2 would reject every real game.
- **Nothing is silently defaulted.** `isKnownRole` gates the ingest in `aggregate.ts`; an
  unrecognised role rejects the upload rather than being guessed into Crewmate.
- **Separators are collapsed.** The mod sends `ICustomRole.IdPart`, so `findRole` compares on a
  lowercased, non-alphanumeric-stripped form — `Soul Collector`, `SoulCollector` and
  `soul_collector` are the same role.
- The DB stores the modifier as `Lover` while both registries call it `Lovers`; `getModifierColor`
  maps the singular explicitly.

Six of TOU-Mira's IdParts resolve to nothing on purpose — they belong to game modes the mod
physically cannot record, because it gates recording at match-state creation on
`CustomGameModeManager.IsClassic()`.

## The role name is a stable key, not a display string

Historically `performer.role` carried a **translated** name, so a host running the game in another
language emitted names the server could not match — the league's hosts running English was an
undocumented dependency.

Resolved mod-side: the payload now carries the locale-independent `ICustomRole.IdPart`
(`public string IdPart => "Sheriff";`) rather than `MiraLocaleManager.Get(RoleNameLocale)`. The
allow-list is keyed on that, and the host's language no longer matters.
