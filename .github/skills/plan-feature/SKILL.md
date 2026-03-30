---
name: plan-feature
description: Plan a new user-facing feature for townofus.pl. Produces a human-reviewed PLAN.md and then splits it into self-contained AI-executable task files. Use this skill when asked to plan a new feature, design how to implement something, or create a feature implementation roadmap.
---

# Plan Feature

This skill produces an implementation plan for a new feature and splits it into self-contained
task files that any AI agent can execute in a fresh context. Plans are stored locally in
`.ai-plans/<feature-slug>/` and are never committed.

## Overview of the workflow

```
Phase 1: Explore + Draft PLAN.md  →  iterate with user until approved
Phase 2: Split into task files    →  only after explicit user approval
Phase 3: DOCS.md suggestions      →  documentation update recommendations
```

Do NOT split into tasks until the user explicitly says the plan is approved.

---

## Phase 1 — Explore and draft PLAN.md

### 1a. Understand the feature request

Ask the user:

1. What is the feature? (1-2 sentences, user/business perspective)
2. What problem does it solve or what value does it add?
3. Any specific UI/UX requirements or constraints?
4. Are there related existing features to reference or extend?

If the user provides a clear description, proceed to exploration without asking further questions.

### 1b. Explore the codebase

Use the Task (explore) agent to understand:

- Which existing files will need to change
- What data is already available vs. what needs to be added
- Relevant constants, types, utilities, and patterns

Focus on:
- Service layer (`_services/`) — what queries exist, what's missing
- Component layer — which components to extend or create
- Navigation — URL patterns, routing, entry points
- Any constraints (D1 limits, Cloudflare Workers, soft deletes, season filtering)

### 1c. Draft PLAN.md

Create `.ai-plans/<feature-slug>/PLAN.md` with this structure:

```markdown
# Plan: <Feature Name>

## What we're building
<1-2 sentences, user perspective>

## URL / Entry points
<Where users access this feature>

## Data layer changes
<What service functions need to change or be created>

## Component changes
<What components need to change or be created>

## Navigation changes
<Routing, URL helpers, switchers, links>

## Open decisions
<Unresolved questions requiring user input. For each decision, list the options
and recommend a default. Example:
- Stars display: cumulative total across seasons (recommended) vs. per-season breakdown?
- Season 1: include or skip? (recommended: skip — no boundary date)>

## Design Decisions
<Leave empty initially. Filled in as open decisions get resolved during iteration.
Example:
| Decision | Value |
|---|---|
| Stars | Cumulative total across all seasons |
| Season 1 | Skipped |>

## Architecture Notes
<Non-obvious implementation patterns the agent will need. Include:
- New sentinel values or constants (e.g. ALL_SEASONS = 0)
- New helper functions with their signatures
- Type changes (show before/after)
- Component mode flags and how they affect rendering
Leave empty if no unusual patterns are needed.>

## Out of scope
<Explicitly list what this plan does NOT cover>

## Proposed tasks
<High-level list of 4-10 tasks, each 1 line. This is a draft — the final task
list will be settled when splitting in Phase 2.>
```

### 1d. Iterate with the user

Present the PLAN.md content and ask:
- Do the open decisions have answers?
- Is anything missing or wrong?
- Should anything be added to "out of scope"?

When presenting options for open decisions, **always recommend a default** and explain why.
Do not leave the user with a bare list of options — make the tradeoffs clear so they can
confirm or override quickly.

As decisions are resolved, move them from "Open decisions" to "Design Decisions" and populate
"Architecture Notes" with any non-obvious implementation patterns they imply.

Update PLAN.md based on feedback. Repeat until the user says something like:
"looks good", "approved", "go ahead", "split it".

---

## Phase 2 — Split into task files

Only proceed here after explicit user approval of the plan.

Create `.ai-plans/<feature-slug>/tasks/` directory.
Write one file per task: `01-<slug>.md`, `02-<slug>.md`, etc.

The task list in PLAN.md is a draft — tasks may be merged or split during this phase
based on what makes sense for independent execution. The final set of files is authoritative.

### Task file format

Each task file must contain:

```markdown
# Task NN — <Short title>

## Goal
<2-4 sentences — what this task achieves and why>

## Files to modify
| File | Change |
|---|---|
| `path/to/file.ts` | What changes |

## Files to create
<Omit this section if no new files are created>
| File | Role |
|---|---|
| `path/to/new/file.ts` | What it does |

## Prerequisite
<Which earlier tasks must be done first, or "None">

## Specs
<Detailed implementation specs with exact code snippets for every change.
Show "Current:" and "New:" blocks for edits. Be exhaustive — the agent should
not need to guess anything.>

## Verification
<How to confirm correctness — typically `npm run build` plus observable behaviour.
If this task intentionally leaves a TypeScript error for a later task to fix,
call that out explicitly: "Expect one error in X.tsx — that is correct and will
be fixed in Task NN.">

## Agent Prompt
<A fully self-contained prompt for a fresh agent session with zero prior context.
Include:
- Project tech stack and key constraints
- The exact changes to make, with code snippets
- What to run to verify
- Any expected intermediate build errors and why they are correct
The agent must be able to execute this task with only this prompt and the codebase.>
```

### Ordering tasks

Order tasks so that every task's prerequisites are earlier in the list:
1. Foundation — constants, types, URL helpers (no behaviour change)
2. Service layer — data queries (build on foundation types)
3. Components — UI changes (build on service types)
4. Navigation — entry points and routing (build on components)
5. New routes/pages — the new page itself (depends on everything above)

### Task sizing

Each task should be completable in one agent session. Size by **independent testability**:
a task is the right size when it can be verified in isolation (usually `npm run build` +
one observable behaviour). Tightly coupled files that cannot be tested independently belong
in the same task. If a task's verification requires finishing another task first, it is
probably too large or the split point is wrong.

A rough guideline: one to three files per task. More than three is a signal to reconsider,
but follow the testability principle — not the file count.

---

## Phase 3 — DOCS.md

After writing all task files, create `.ai-plans/<feature-slug>/DOCS.md` with suggested
additions or edits to:

- `AGENTS.md` — new patterns, constants, or architectural decisions
- `.github/instructions/*.instructions.md` — file-type-specific conventions
- `.github/skills/` — if a new reusable pattern emerged

Format each suggestion as:

```markdown
## N. <File to edit>

**Section:** <Section name>

**Add/Replace:**
<Exact text to add, in the same format as the target file>

**Reason:** <Why this should be captured>
```

---

## Townofus.pl — Project-specific constraints

These constraints MUST be reflected in task specs and Agent Prompts:

### D1 SQL variable limit
Never use `season: { in: [...] }` or `id: { in: largeArray }`. For all-seasons queries,
omit the season filter entirely:
```typescript
...(seasonId !== ALL_SEASONS && { season: seasonId ?? CURRENT_SEASON })
```

### Soft deletes
Every model has `deletedAt DateTime?`. Always include `...withoutDeleted` in where clauses.
Exception: `GamePlayerStatistics` has NO `deletedAt` — filter via `player: withoutDeleted` or
`game: { ...withoutDeleted }` instead.

### Server vs Client components
`_services/` functions are Server-Component-only. Never call from client components.
Utility functions (`gameUtils.ts`, `seasonHelpers.ts`) are safe for both.

### Prisma `findUnique` with soft deletes
Use `findFirst` instead of `findUnique` when adding `...withoutDeleted` to a PK lookup.

### Season awareness
All data service functions accept `seasonId?: number` and default to `CURRENT_SEASON`.
Use `buildSeasonGameWhere()` from `_services/db.ts` for game where clauses.

### Cloudflare Workers context
`getCloudflareContext()` is unavailable at build time — all service functions must guard:
```typescript
if (!prisma) return <empty default>;
```

---

## Storage locations

| File | Committed? | Purpose |
|---|---|---|
| `.ai-plans/<slug>/PLAN.md` | No | Human-reviewed plan |
| `.ai-plans/<slug>/tasks/*.md` | No | AI-executable task files |
| `.ai-plans/<slug>/DOCS.md` | No | Doc update suggestions |
| `.github/skills/plan-feature/SKILL.md` | Yes | This skill definition |

`.ai-plans/` is in `.gitignore`. Plans are local-only, not committed.
