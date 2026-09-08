---
name: weekly-content-update
description: Perform the weekly Dramaafera content update — add emperor poll JSON and add a new playlist entry. Use this skill when asked to do a weekly update, add a new emperor poll, update the playlist, or asked about the settings changelog rotation (which is automated — the skill explains why there is nothing to do).
---

# Weekly Dramaafera Content Update

The recurring content update after each Dramaafera gaming session.

**Two tasks for you:** the emperor poll JSON (Step 1) and the playlist entry (Step 3).
Settings rotation (Step 2) is automated via the host panel — it is documented here only
so you know not to touch it.

## Prerequisites

**Before starting, check available player avatars** in `public/images/avatars/` directory. These file names are the source of truth for correct player nicknames (with proper capitalization). The screenshot from discord polls is always in ALL CAPS, so you must normalize nicks by comparing against available avatar files.

If the user attaches the poll screenshot, a new avatar image, or the YouTube ID in the same message, extract those values directly instead of asking follow-up questions. Only ask for what is still missing.

Match case-insensitively, then copy the file name's casing **verbatim** — do NOT
lowercase. `getPlayerAvatarPath` (`_utils/gameUtils.ts`) interpolates the nickname
straight into `/images/avatars/${playerName}.png`, so any casing drift = broken image.

Examples: `ZIOMSON` → `ziomson.png` → `ziomson`; `BARTEK` → `Bartek.png` → `Bartek`;
`EFFIGY` → `EFFIGY.png` → `EFFIGY`.

Gather the following from the user before starting:

| Data             | Required | Format                          | Example                   |
|------------------|----------|---------------------------------|---------------------------|
| Session date     | Yes      | `YYYYMMDD`                      | `20260401`                |
| Emperor poll     | Yes      | Nickname (from avatars) + vote count | See mapping below        |
| Poll question    | No       | String (default below)           | —                         |
| YouTube video ID | Yes      | 11-char YT ID                    | `bnMarasYTpU`            |
| Week label       | Derived  | Season + week number             | see Step 3 — do not ask   |

Settings are **not** collected here — the host uploads them through the panel (Step 2).
Never ask the user to paste `dramaafera.txt` content.

**Nickname mapping from screenshot to avatars:**
- Screenshot shows names in ALL CAPS (e.g., `SZYMONIX18`, `ZIOMSON`, `BARTEK`)
- Match each ALL CAPS name against files in `public/images/avatars/` directory
- Use the avatar file name (with original capitalization) as the canonical nickname
- If a new avatar image is already present in `public/images/avatars/`, add its file name
  (without extension) to `src/app/dramaafera/_constants/avatars.ts` in the same update.
  That constant feeds the **Lista Cweli** host tab only — a missing entry means the player
  cannot be picked there. Skip `placeholder` and non-`.png` files.

## Step 1: Create Emperor Poll JSON

Create `public/emperor-polls/<YYYYMMDD>.json` with this exact structure:

```json
{
	"date": "<YYYYMMDD>",
	"question": "KTO ZOSTANIE EMPEROREM PO DZISIEJSZEJ SESJI?",
	"totalVotes": <sum_of_all_votes>,
	"votes": [
		{
			"nickname": "<player1>",
			"votes": <count>
		},
		{
			"nickname": "<player2>",
			"votes": <count>
		}
	]
}
```

Rules:
- Use tabs for indentation (match existing files)
- `totalVotes` MUST equal the sum of all individual `votes` values
- `question` defaults to `"KTO ZOSTANIE EMPEROREM PO DZISIEJSZEJ SESJI?"` unless user specifies otherwise
- File must be valid JSON — validate before saving
- Verify no file with the same date already exists

## Step 2: Rotate Settings Changelog — AUTOMATED, no action required

**This step is fully handled by the host panel. Do not do anything for it.**

Settings live in the D1 `drama_afera_settings` table. The host uploads the new
`.txt` themselves via the **Ustawienia** tab in `/dramaafera/host` → **Wgraj Plik
Ustawień**, which calls `uploadSettingsAction`. That action rotates atomically:
new content becomes `current`, the old `current` is demoted to `old`, and the
previous `old` is soft-deleted
(`src/app/dramaafera/_services/settings/writeDramaAferaSettings.ts`).

Consequences for this skill:
- Do NOT ask the user for settings file content
- Do NOT accept a pasted `dramaafera.txt` and try to apply it — there is no file
  to edit; the content lives in D1 and the only write path is the authenticated
  server action
- Do NOT modify `public/settings/dramaafera*.txt` — consumed only by the legacy
  `dramaafera-old/` section, not the source of truth
- If the host has not uploaded yet, just tell them to; then continue with the
  other steps

To confirm it happened, the GET endpoint is public:
`GET /api/dramaafera/settings` returns `{ current, old }`.

## Step 3: Add Playlist Entry

Edit `src/app/dramaafera/playlista/page.tsx` — **prepend** a new entry to the beginning of the `weeks` array:

```typescript
{ id: "s3week<N>", title: "S3 WEEK <N>", videoId: "<YOUTUBE_ID>" },
```

**Derive the label — never ask the user for it, never hardcode it here:**
- Season = `CURRENT_SEASON` from `src/app/dramaafera/_constants/seasons.ts`
- Week = week number of the array's current **first** entry, + 1

The array is the source of truth for the week counter. Do NOT derive the week from
a DB session count — the playlist tracks published YouTube VODs, not sessions, and
the two have drifted (13 S3 sessions vs 7 playlist entries as of 2026-06). Counting
sessions would silently renumber every existing entry.

Rules:
- Insert as the **first** element of the `weeks` array (newest week goes on top)
- The `id` is lowercase with no spaces: `s<season>week<N>`
- The `title` uses uppercase with spaces: `S<season> WEEK <N>`
- Do NOT remove or modify any existing entries
- Preserve the existing formatting and trailing comma style

## Step 4: Verify

After making all changes:
1. Validate the JSON file is parseable: `node -e "require('./public/emperor-polls/<DATE>.json')"`
2. Settings need no verification from you (Step 2 is automated). If you want to
   confirm the host uploaded: `GET /api/dramaafera/settings` or `/dramaafera/changelog`.
3. Verify the playlista page compiles: `npm run build`
   (do NOT run `npx tsc --noEmit <single-file>` — it bypasses `tsconfig.json`, so the
   `@/*` path alias and `jsx` option are unset and it reports dozens of false errors)

## Commit Convention

Historic PRs used `playlista, changelog, emp_poll[, avatar]`, but `changelog` is now
misleading — settings live in D1 and never appear in the diff. Name only what you
actually changed:
- `playlista, emp_poll`
- `playlista, emp_poll, avatar` (if avatars were also added)
