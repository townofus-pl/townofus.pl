# Vendored skills

Some skills in this directory are **copied from an upstream project**, not authored here.
Everything not listed below is ours and can be edited freely.

## Upstream: mattpocock/skills

- **Source**: https://github.com/mattpocock/skills
- **License**: MIT — Copyright (c) 2026 Matt Pocock (see upstream `LICENSE`)
- **Synced at commit**: `84fdeffd12f2ee307994d1eb6feb48173b6e0502` (2026-08-06)

| Skill in this repo | Upstream path                        |
|--------------------|--------------------------------------|
| `wayfinder`        | `skills/engineering/wayfinder`       |
| `triage`           | `skills/engineering/triage`          |
| `research`         | `skills/engineering/research`        |
| `prototype`        | `skills/engineering/prototype`       |
| `domain-modeling`  | `skills/engineering/domain-modeling` |
| `grilling`         | `skills/productivity/grilling`       |

These are **verbatim copies** — no renames, no local edits. Names match upstream, which
matters because `wayfinder` calls the others internally as `/research`, `/prototype`,
`/grilling`, and `/domain-modeling`. Don't edit them in place; send changes upstream and
re-sync.

Names are not prefixed. The globally-installed plugin exposes the same skills as
`mattpocock-skills:*`, so the namespaces can't collide.

## Why these six

`wayfinder` is the entry point; the other four leaf skills are its ticket types. `triage`
is independent but shares `grilling` and `domain-modeling`. Nothing else in the closure —
verified with a transitive scan of skill cross-references.

## Re-syncing

`git pull` in `~/Projects/skills`, then:

```sh
SRC=~/Projects/skills/skills
cd <repo>
for s in wayfinder triage research prototype domain-modeling; do
  rm -rf ".github/skills/$s" && cp -R "$SRC/engineering/$s" .github/skills/
done
rm -rf .github/skills/grilling && cp -R "$SRC/productivity/grilling" .github/skills/
```

Then update the commit SHA above. Symlinks in `.claude/skills/` point at directory names,
so they survive a re-sync untouched.

## Adding a skill to this repo

Every directory in `.github/skills/` needs a matching symlink in `.claude/skills/`, or the
skill is invisible to Claude Code:

```sh
ln -sfn ../../.github/skills/<name> .claude/skills/<name>
```
