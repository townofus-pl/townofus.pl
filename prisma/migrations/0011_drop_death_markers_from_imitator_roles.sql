-- Earlier mod builds appended a death marker to `imitatorRoles` when the Imitator died, so one
-- copy of the Sheriff was stored as `["Sheriff","CrewmateGhost"]`. The ingest now drops them
-- (`isDeathMarker` in api/v2/games/_utils/aggregate.ts); this brings the rows already stored into
-- line. Same test as the mod's `RoleHistoryView.IsDeathMarker`: a name ending in `Ghost` or
-- `Afterlife`, case-sensitive, hence GLOB rather than LIKE.
--
-- Measured before writing it: 1 row on staging, 0 on production. An array left empty becomes
-- NULL, which is what the ingest writes for a player with no copies.
UPDATE "game_player_statistics"
SET "imitatorRoles" = (
    SELECT CASE WHEN COUNT(*) = 0 THEN NULL ELSE json_group_array(value) END
    FROM (
        SELECT value FROM json_each("game_player_statistics"."imitatorRoles")
        WHERE value NOT GLOB '*Ghost' AND value NOT GLOB '*Afterlife'
        ORDER BY key
    )
)
WHERE "imitatorRoles" IS NOT NULL
  AND EXISTS (
      SELECT 1 FROM json_each("game_player_statistics"."imitatorRoles")
      WHERE value GLOB '*Ghost' OR value GLOB '*Afterlife'
  );
