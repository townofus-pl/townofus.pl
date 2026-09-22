---
name: publish-client-mod
description: Publish a new client-plugin build or hat bundle to /mod/client and update the auto-update manifest. Use this skill when asked to ship new hats, a new DramaAferaStats.Client.dll, or to fix a manifest whose hashes no longer match the files.
---

# Publish the client mod

The mod's auto-updater fetches `{BaseUrl}/mod/client/latest.json` on every game launch, compares
SHA-256 **per file**, and downloads only what changed. This skill keeps that manifest honest.

The workflow is **put the files in place, then reconcile**. The tool never copies anything and
never fetches anything: it hashes what is actually sitting in `public/mod/client/`. That way the
published hash can only ever describe the published bytes.

**Never edit `latest.json` by hand.** A manifest that disagrees with its files fails silently —
every player refuses the update and only their own log says why.

## Step 1 — copy the new files into place

```bash
cp ~/Downloads/malkizhats/* public/mod/client/
```

Bare file names only. The mod writes `name` straight into the player's `BepInEx/plugins` folder
and refuses anything containing `/`, `\` or `..`, and so does this tool.

## Step 2 — read the report before changing anything

```bash
npm run mod:publish
```

Read-only. It exits non-zero when the manifest and the files disagree, and says which is which:

```
public/mod/client/latest.json — version 1.0.0

  CHANGED      DramaAferaStats.Client.dll         154,112 B  33e5ac25…
  same         malkizhats.bundle                2,100,434 B  41a2d352…
  NEW          malkizhats.catalog                  41,264 B  d9fc48f5…
```

| State | Meaning |
|---|---|
| `same` | the manifest already describes these bytes; players will not re-download it |
| `CHANGED` | the file differs from the manifest — players will fetch it |
| `NEW` | published but not in the manifest yet — no client would fetch it |
| `MISSING` | in the manifest with no file beside it — every client fails that entry, every launch |
| `+url` | the entry's `url` is not the relative form (see below) |

**This is the checkpoint.** A file you meant to replace that reads `same` means you copied the
version that is already live. A file you did not touch that reads `CHANGED` means something
unintended is about to ship. Stop and fix the folder, do not proceed.

## Step 3 — write the manifest

```bash
npm run mod:publish -- --write
```

`--write` is the only thing that touches `latest.json`. Then commit:

```bash
git add public/mod/client && git commit -m "feat(mod): new hat bundle"
```

Deploying is a separate, deliberate step. Nothing reaches players until production is deployed.

## Why the urls are relative

Each entry's `url` is the bare file name, which the mod resolves against the manifest's own URL
(`Uri.TryCreate(new Uri(manifestUrl), file.Url, …)` in `AutoUpdater.cs`).

That is what makes `DRAMAAFERA_BASE_URL` work. Point the mod at staging and both the manifest and
its files come from staging:

```
DRAMAAFERA_BASE_URL=https://townofus-pl-staging.livechat-expert.workers.dev %command%
```

An absolute `https://townofus.pl/...` url would send a staging client to production bytes, which
is the one thing that override exists to avoid. A leading `/` is just as wrong — it resolves to
the site root rather than beside the manifest. The report flags both as `+url`.

`name` and `url` stay separate fields even while they hold the same string: `name` is where the
file lands on the player's disk, `url` is where it is fetched from, and a future versioned path
would change only the second.

## Things that have actually gone wrong

- **Publishing a stale build.** The client DLL was rebuilt three times in one hour, each build a
  different hash at the same byte size, and twice the published copy was a build behind. The
  report catches this *only* if you copy the file in first — which is why step 1 exists and why
  the tool no longer takes a source path. For the plugin, hash the copy installed in the league's
  `BepInEx/plugins` folder and confirm it matches before writing.
- **Trusting the version number.** `version` only feeds the log line players see. A rebuild that
  does not bump the assembly version still changes the bytes — which is precisely why the updater
  compares hashes. Omitting `--version` keeps the current one and the release still reaches
  everyone.

## Where the files live

`public/mod/client/` — static assets served at `/mod/client/*` by the Workers assets binding, the
same route `public/files/TownOfUs.dll` uses. No R2 binding is involved.

`public/_headers` sets `no-store` on `/mod/client/*`. The URLs are fixed while their contents
change, so caching would serve players old bytes that fail the hash check — the update would
silently never happen. Do not "optimise" this without giving each release its own URL first.

## Do not publish

`touhats.bundle` / `touhats.catalog` — TOU-Mira's own hats (~23 MB), not the league's, and not
this updater's business. Only the client plugin and `malkizhats.*` belong in the manifest.
