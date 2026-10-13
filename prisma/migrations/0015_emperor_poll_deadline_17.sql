-- Move existing Wednesday 18:00 Warsaw deadlines to 17:00.
-- If creation was already at/after 17:00, use the following Wednesday.
-- Wednesday is never the DST transition day; Warsaw's offset is determined
-- by the last Sunday of March and October, including for the following week.
WITH old_deadlines AS (
 SELECT id,createdAt,closesAt,date(closesAt/1000,'unixepoch') day
 FROM emperor_polls
), legacy AS (
 SELECT * FROM old_deadlines WHERE
 CAST(strftime('%H',closesAt/1000,'unixepoch') AS INTEGER) +
 CASE WHEN day>=date(substr(day,1,4)||'-04-01','weekday 0','-7 days')
 AND day<date(substr(day,1,4)||'-11-01','weekday 0','-7 days') THEN 2 ELSE 1 END = 18
), targets AS (
 SELECT id,date(day,CASE WHEN unixepoch(createdAt,'subsec')*1000>=closesAt-3600000
 THEN '+7 days' ELSE '+0 days' END) day FROM legacy
)
UPDATE emperor_polls SET closesAt=(
 SELECT CAST(unixepoch(targets.day||' 17:00:00')*1000 AS INTEGER) -
 CASE WHEN targets.day>=date(substr(targets.day,1,4)||'-04-01','weekday 0','-7 days')
 AND targets.day<date(substr(targets.day,1,4)||'-11-01','weekday 0','-7 days')
 THEN 7200000 ELSE 3600000 END FROM targets WHERE targets.id=emperor_polls.id
) WHERE id IN (SELECT id FROM targets);
