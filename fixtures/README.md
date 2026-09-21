# Ingest fixtures

`v2-synthetic.json` — a hand-built v2 payload: 15 players, 82 actions, 2 meetings. It exercises
every counter family, all four `isCorrect` cases, the sparse `detail` fields, the 9-rows-per-
statement action chunking and a two-hour timezone shift (`19:14Z` must land as `20261007_2114`).

```
npm run dev
npm run replay -- --file fixtures/v2-synthetic.json --twice
npm run db:import:local -- --no-export   # it writes to local D1, so reseed afterwards
```

It is **not** a golden payload. Nothing here came out of a real match, so it proves the server's
plumbing and nothing about the mod's. [#293](https://github.com/townofus-pl/townofus.pl/issues/293)
replaces it with a capture from a real game on a HEAD build.
