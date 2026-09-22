---
name: publish-client-mod
description: Publish a new client-plugin build or hat bundle to /mod/client and update the auto-update manifest. Use this skill when asked to ship new hats, a new DramaAferaStats.Client.dll, or to fix a manifest whose hashes no longer match the files.
---

# Publish the client mod

The mod's auto-updater polls `https://townofus.pl/mod/client/latest.json` on every game launch,
compares SHA-256 **per file**, and downloads only what changed. This skill publishes files and
regenerates that manifest.

`scripts/publish-client-mod.ts` does the work. **Never write `latest.json` by hand** — the hash
must come from the bytes actually served, and a hand-edited manifest fails silently: every player
refuses the update and only their own log says why.

## The whole job, when the files are in a folder

```bash
npm run mod:publish -- --dir /path/to/new-files
```

That copies every file in the folder into `public/mod/client/`, recomputes every hash, rewrites
the manifest, and prints what changed. **Read that report before committing** — it is the only
place a wrong file is visible before players get it:

```
latest.json — version 1.0.0, 3 file(s)

  same     DramaAferaStats.Client.dll         154,112 B  ac9b9dd8…
  CHANGED  malkizhats.bundle                2,100,434 B  41a2d352…
  CHANGED  malkizhats.catalog                  41,264 B  d9fc48f5…

2 file(s) changed. Players fetch only those, on their next launch.
```

If a file you meant to publish says `same`, you copied the version that is already live. If one
you did not touch says `CHANGED`, you published something unintended.

Then:

```bash
git add public/mod/client && git commit -m "feat(mod): new hat bundle"
```

Deploying is a separate, deliberate step — see `docs/ops/LOCAL_TESTING.md` and the deploy
workflow. Nothing reaches players until production is deployed.

## Named files instead of a folder

```bash
npm run mod:publish -- --file ~/build/DramaAferaStats.Client.dll
```

Already-published files stay in the manifest, so a plugin release does not drop the hats and a hat
release does not drop the plugin.

## Checking an existing manifest

```bash
npm run mod:publish -- --check
```

Verifies in both directions — a manifest entry with no file, a file with no entry, a wrong hash, a
wrong URL — and exits non-zero on any of them. This runs in CI (`.github/workflows/check.yml`).

## Things that have actually gone wrong

- **Publishing a stale build.** `--check` cannot catch this: the manifest agrees with the file
  beside it, and the drift is between that file and the build you meant. Confirm the source is
  fresh before publishing. For the client plugin, the copy installed in the league's
  `BepInEx/plugins` folder is the reference — hash it and compare.
- **Relying on the version number.** `version` only feeds the log line players see. A rebuild that
  does not bump the assembly version still changes the bytes, which is exactly why the updater
  compares hashes. Omitting `--version` keeps the current one, and the release still reaches
  everyone.

## Where the files live and why

`public/mod/client/` — static assets served at `/mod/client/*` by the Workers assets binding, the
same route `public/files/TownOfUs.dll` uses. No R2 binding is involved.

`public/_headers` sets `no-store` on `/mod/client/*`. The URLs are fixed while their contents
change, so caching them would serve players old bytes that fail the hash check — the update would
silently never happen. Do not "optimise" this without giving each release its own URL first.

## Do not publish

`touhats.bundle` / `touhats.catalog` — those are TOU-Mira's own hats (~23 MB), not the league's,
and not this updater's business. Only the league's own files belong in the manifest: the client
plugin and `malkizhats.*`.
