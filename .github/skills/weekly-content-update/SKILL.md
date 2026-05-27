---
name: weekly-content-update
description: Perform the weekly Dramaafera content update — add emperor poll JSON, rotate settings changelog, and add a new playlist entry. Use this skill when asked to do a weekly update, add a new emperor poll, update the playlist, or rotate the settings changelog.
---

# Weekly Dramaafera Content Update

This skill automates the recurring weekly content update that happens after each Dramaafera gaming session. It involves up to three independent tasks that are always done together.

## Prerequisites

**Before starting, check available player avatars** in `public/images/avatars/` directory. These file names are the source of truth for correct player nicknames (with proper capitalization). The screenshot from discord polls is always in ALL CAPS, so you must normalize nicks by comparing against available avatar files.

If the user attaches the poll screenshot, the new settings file, a new avatar image, or the YouTube ID in the same message, extract those values directly instead of asking follow-up questions. Only ask for what is still missing.

Example: If screenshot shows `ZIOMSON` and you see `ziomson.png` in avatars folder, use `ziomson` (lowercase).

Gather the following from the user before starting:

| Data             | Required | Format                          | Example                   |
|------------------|----------|---------------------------------|---------------------------|
| Session date     | Yes      | `YYYYMMDD`                      | `20260401`                |
| Emperor poll     | Yes      | Nickname (from avatars) + vote count | See mapping below        |
| Poll question    | No       | String (default below)           | —                         |
| New settings     | Yes      | Full `dramaafera.txt` content    | User provides the file    |
| YouTube video ID | Yes      | 11-char YT ID                    | `bnMarasYTpU`            |
| Week label       | Yes      | Season + week number             | `S3 WEEK 1`              |

**Nickname mapping from screenshot to avatars:**
- Screenshot shows names in ALL CAPS (e.g., `SZYMONIX18`, `ZIOMSON`, `BARTEK`)
- Match each ALL CAPS name against files in `public/images/avatars/` directory
- Use the avatar file name (with original capitalization) as the canonical nickname
- Example conversion: `SZYMONIX18` (screenshot) → `szymonix18.png` (file) → `szymonix18` (use in JSON)
- If a new avatar image is already present in `public/images/avatars/`, add its file name to `src/app/dramaafera/_constants/avatars.ts` in the same update.

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

## Step 2: Rotate Settings Changelog

Settings are stored in the D1 `drama_afera_settings` table. The host uploads
the new file via the **Ustawienia** tab in `/dramaafera/host` (Settings Tab UI),
which calls the `uploadSettingsAction` server action. The action performs an
atomic rotation: new content becomes `current`, the existing `current` is
demoted to `old`, and the previous `old` is soft-deleted.

If the user attaches the settings file in this conversation, instruct them
(or, if you have host credentials, perform on their behalf):

1. Log into `/dramaafera/host` (Basic Auth gated by `src/middleware.ts`).
2. Open the **Ustawienia** tab.
3. Use the **Wgraj Plik Ustawień** form to upload the new `.txt`. The server
   action handles the rotation atomically (see
   `src/app/dramaafera/_services/settings/writeDramaAferaSettings.ts`).

For history-only access or full content snapshots, the GET endpoint is public:
`GET /api/dramaafera/settings` returns `{ current, old }`.

Both files use a line-based format alternating between role color tags and values:
```
<color=#HEXCOLORFF>RoleName</color>
50
```

Rules:
- Preserve the exact formatting — no trailing whitespace, no extra newlines
- The file is ~728 lines — upload the entire file content
- If the user provides the new settings as a file attachment or pasted text, use it verbatim
- Do NOT modify `public/settings/dramaafera*.txt` — those files are now only
  consumed by the legacy `dramaafera-old/` section and are not the source of
  truth for the current dramaafera pages.

## Step 3: Add Playlist Entry

Edit `src/app/dramaafera/playlista/page.tsx` — **prepend** a new entry to the beginning of the `weeks` array:

```typescript
{ id: "s3week<N>", title: "S3 WEEK <N>", videoId: "<YOUTUBE_ID>" },
```

Rules:
- Insert as the **first** element of the `weeks` array (newest week goes on top)
- The `id` is lowercase with no spaces: `s3week2`
- The `title` uses uppercase with spaces: `S3 WEEK 2`
- Do NOT remove or modify any existing entries
- Preserve the existing formatting and trailing comma style

## Step 4: Verify

After making all changes:
1. Validate the JSON file is parseable: `node -e "require('./public/emperor-polls/<DATE>.json')"`
2. After settings upload via the host UI, hit `GET /api/dramaafera/settings`
   (or visit `/dramaafera/changelog`) and confirm the new `current`/`old` rows
   differ as expected.
3. Verify the playlista page compiles: `npx tsc --noEmit src/app/dramaafera/playlista/page.tsx` or run `npm run build`

## Commit Convention

When committing this weekly update, use one of these patterns observed in past PRs:
- `playlista, changelog, emp_poll` (most common)
- `playlista, changelog, emp_poll, avatar` (if avatars were also added)
