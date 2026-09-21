# v2 ingest: action → counter mapping

Resolution artifact for [#295](https://github.com/townofus-pl/townofus.pl/issues/295). This is the
spec `api/v2/games/_utils/aggregate.ts` implements.

Verified against `dramaafera-stats-mod` at `TOU-Mira` submodule `b09079db` (2026-09-06).

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

### Three gaps that must be closed before ingest

1. **`normalizeRoleName` never searches `MiraRoles`.** `src/app/dramaafera/_utils/gameUtils.ts`
   resolves against the `Roles` array only, so every one of the 77 is unresolvable today. It needs
   to be era-aware: legacy registry for v1 games, Mira registry for v2.
2. **Vanilla roles are not in either registry.** `CorrectnessChecker.GetRoleName` falls back to
   `role.Role.ToString()` for anything that is not an `ICustomRole`, which emits the Among Us
   `RoleTypes` enum name. Observed in real captures: **`Crewmate`, `Impostor`, `CrewmateGhost`,
   `ImpostorGhost`**. `NeutralGhostRole` additionally emits the literal **`Neutral Ghost`** (with a
   space) when it has no underlying player. All five must be in the allow-list or v2 rejects every
   real game.
3. **The silent Crewmate default must go.** `determineTeam` returns `Teams.Crewmate` for anything
   unrecognised, which corrupts `winnerTeam`. Under v2 the winner comes from `players[*].win`
   anyway, so `determineTeam` should raise rather than guess.

Also noted: the DB stores the modifier as **`Lover`** while `src/modifiers/lovers.ts` is named
**`Lovers`**, so `getModifierColor` misses and returns white.

## ⚠️ Open cross-repo issue: the role name is localised

`performer.role` carries a **translated display string**, not a stable key:

```csharp
// MiraAPI/Roles/ICustomRole.cs
string RoleName       => MiraLocaleManager.Get(RoleNameLocale);
string RoleNameLocale => MiraLocaleManager.BuildTranslationId(IdPrefix, IdPart);
```

Every role also exposes a locale-independent `IdPart` (`public string IdPart => "Sheriff";`), and
that is what the payload should carry. As written, **a host running the game in another language
emits role names the server cannot match**, and the allow-list rejects the whole game.

It works today only because the league's hosts run English. Raised mod-side; until it is fixed,
the allow-list is keyed on the English `RoleName` values and the hosts' language is an undocumented
dependency.
