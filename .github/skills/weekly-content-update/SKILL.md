---
name: weekly-content-update
description: Perform the weekly Dramaafera content update — add emperor poll JSON, rotate settings changelog, and add a new playlist entry. Use this skill when asked to do a weekly update, add a new emperor poll, update the playlist, or rotate the settings changelog.
---

# Weekly Dramaafera Content Update

This skill automates the recurring weekly content update that happens after each Dramaafera gaming session. It involves up to three independent tasks that are always done together.

## Prerequisites

**Before starting, check available player avatars** in `public/images/avatars/` directory. These file names are the source of truth for correct player nicknames (with proper capitalization). The screenshot from discord polls is always in ALL CAPS, so you must normalize nicks by comparing against available avatar files.

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

This is a two-part rotation:

1. **Copy** the current content of `public/settings/dramaafera.txt` into `public/settings/dramaafera_old.txt` (overwrite)
2. **Replace** the content of `public/settings/dramaafera.txt` with the new settings provided by the user

Both files use a line-based format alternating between role color tags and values:
```
<color=#HEXCOLORFF>RoleName</color>
50
```

Rules:
- Preserve the exact formatting — no trailing whitespace, no extra newlines
- The files are ~728 lines each — always replace the entire file content
- If the user provides the new settings as a file attachment or pasted text, use it verbatim

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
2. Check that `dramaafera.txt` and `dramaafera_old.txt` are different files (the old one has previous session's settings)
3. Verify the playlista page compiles: `npx tsc --noEmit src/app/dramaafera/playlista/page.tsx` or run `npm run build`

## Commit Convention

When committing this weekly update, use one of these patterns observed in past PRs:
- `playlista, changelog, emp_poll` (most common)
- `playlista, changelog, emp_poll, avatar` (if avatars were also added)
