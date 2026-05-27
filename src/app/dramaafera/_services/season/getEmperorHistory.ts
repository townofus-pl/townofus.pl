import { getDatabaseClient, buildSeasonGameWhere } from '../db';
import { chunkedInQuery } from '@/app/api/_database';
import { withoutDeleted } from '@/app/api/schema/common';

export interface EmperorEntry {
  nickname: string;
  count: number;
  dates: string[];
  isLatest: boolean;
}

// Implementation note: full-season query — a nested `gamePlayerStatistics`
// include here would emit `WHERE gameId IN (…473 ids)` and trip D1's 98
// bound-parameter cap on Prisma 7 (P2029). Chunked two-step fetch instead.
export async function getEmperorHistory(
  seasonId?: number,
): Promise<EmperorEntry[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];

  const allGames = await prisma.game.findMany({
    where: buildSeasonGameWhere(seasonId),
    select: { id: true, startTime: true },
    orderBy: { startTime: 'asc' },
  });

  if (allGames.length === 0) return [];

  const gameIds = allGames.map((g) => g.id);
  const rawStats = await chunkedInQuery(gameIds, (chunk) =>
    prisma.gamePlayerStatistics.findMany({
      where: { gameId: { in: chunk }, player: withoutDeleted },
      select: { gameId: true, playerId: true, totalPoints: true },
    }),
  );

  const uniquePlayerIds = Array.from(new Set(rawStats.map((s) => s.playerId)));
  const dbPlayers = await chunkedInQuery(uniquePlayerIds, (chunk) =>
    prisma.player.findMany({
      where: { id: { in: chunk } },
      select: { id: true, name: true },
    }),
  );
  const playerNameById = new Map(dbPlayers.map((p) => [p.id, p.name]));

  const statsByGameId = new Map<number, typeof rawStats>();
  rawStats.forEach((s) => {
    const list = statsByGameId.get(s.gameId) ?? [];
    list.push(s);
    statsByGameId.set(s.gameId, list);
  });

  // Group games by date (YYYY-MM-DD)
  const gamesByDate = new Map<string, typeof allGames>();
  allGames.forEach((game) => {
    const dateKey = game.startTime.toISOString().split('T')[0];
    if (!gamesByDate.has(dateKey)) {
      gamesByDate.set(dateKey, []);
    }
    gamesByDate.get(dateKey)!.push(game);
  });

  const allDates = Array.from(gamesByDate.keys()).sort();

  if (allDates.length === 0) return [];

  const emperorsByDate: Array<{ date: string; nickname: string }> = [];

  for (let i = 0; i < allDates.length; i++) {
    const dateKey = allDates[i];
    const gamesOnDate = gamesByDate.get(dateKey)!;

    const playerPoints = new Map<string, { playerId: number; points: number }>();
    gamesOnDate.forEach((game) => {
      const gameStats = statsByGameId.get(game.id) ?? [];
      gameStats.forEach((stat) => {
        const nickname = playerNameById.get(stat.playerId);
        if (!nickname) return;
        const current = playerPoints.get(nickname);
        if (current) {
          current.points += stat.totalPoints;
        } else {
          playerPoints.set(nickname, {
            playerId: stat.playerId,
            points: stat.totalPoints,
          });
        }
      });
    });

    if (playerPoints.size === 0) continue;

    const maxPoints = Math.max(
      ...Array.from(playerPoints.values()).map((p) => p.points),
    );
    const playersWithMaxPoints = Array.from(playerPoints.entries())
      .filter(([, data]) => data.points === maxPoints)
      .map(([nickname]) => nickname);

    if (playersWithMaxPoints.length === 1) {
      emperorsByDate.push({ date: dateKey, nickname: playersWithMaxPoints[0] });
    }
  }

  const emperorMap = new Map<string, { count: number; dates: string[] }>();
  emperorsByDate.forEach(({ date, nickname }) => {
    const existing = emperorMap.get(nickname);
    if (existing) {
      existing.count++;
      existing.dates.push(date);
    } else {
      emperorMap.set(nickname, { count: 1, dates: [date] });
    }
  });

  const latestEmperor =
    emperorsByDate.length > 0
      ? emperorsByDate[emperorsByDate.length - 1].nickname
      : null;

  return Array.from(emperorMap.entries())
    .map(([nickname, data]) => ({
      nickname,
      count: data.count,
      dates: data.dates,
      isLatest: nickname === latestEmperor,
    }))
    .sort((a, b) => b.count - a.count);
}
