import { getDatabaseClient, buildSeasonGameWhere } from '../db';
import { chunkedInQuery } from '@/app/api/_database';
import { withoutDeleted } from '@/app/api/schema/common';
import { formatDisplayDate } from '@/app/dramaafera/_utils/gameUtils';

export interface GameDateGameEntry {
  id: number;
  gameIdentifier: string;
  allPlayerNames?: string[];
}

export interface GameDateEntry {
  date: string;
  displayDate: string;
  totalGames: number;
  games: GameDateGameEntry[];
  allPlayerNames?: string[];
}

export interface GameDatesResult {
  dates: GameDateEntry[];
  totalDates: number;
}

// Implementation note: with `includePlayers=true`, a nested
// `gamePlayerStatistics → player` include here would emit `WHERE gameId IN (…473
// ids)` then `WHERE id IN (…playerIds)` and trip D1's 98 bound-parameter cap on
// Prisma 7 (P2029). Chunked two-step fetch when players are requested.
export async function getGameDatesLightweight(
  includePlayers = false,
  seasonId?: number,
): Promise<GameDatesResult> {
  const prisma = await getDatabaseClient();
  if (!prisma) return { dates: [], totalDates: 0 };

  const where = buildSeasonGameWhere(seasonId);

  const games = await prisma.game.findMany({
    where,
    select: { id: true, gameIdentifier: true, startTime: true },
    orderBy: { startTime: 'desc' },
  });

  // Resolve player names per-game when requested, chunked.
  const namesByGameId = new Map<number, string[]>();
  if (includePlayers && games.length > 0) {
    const gameIds = games.map((g) => g.id);
    const rawStats = await chunkedInQuery(gameIds, (chunk) =>
      prisma.gamePlayerStatistics.findMany({
        where: { gameId: { in: chunk }, player: withoutDeleted },
        select: { gameId: true, playerId: true },
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

    rawStats.forEach((s) => {
      const name = playerNameById.get(s.playerId);
      if (!name) return;
      const list = namesByGameId.get(s.gameId) ?? [];
      list.push(name);
      namesByGameId.set(s.gameId, list);
    });
  }

  const dateGroups = new Map<
    string,
    {
      date: string;
      displayDate: string;
      games: GameDateGameEntry[];
      totalGames: number;
      allPlayerNames: Set<string>;
    }
  >();

  games.forEach((game) => {
    let dateKey = '';
    let displayDate = '';

    if (game.gameIdentifier) {
      const datePart = game.gameIdentifier.split('_')[0];
      if (datePart && datePart.length === 8) {
        dateKey = datePart;
        displayDate = formatDisplayDate(datePart);
      }
    } else if (game.startTime) {
      const d = new Date(game.startTime);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      dateKey = `${year}${month}${day}`;
      displayDate = d.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    if (!dateKey) return;

    if (!dateGroups.has(dateKey)) {
      dateGroups.set(dateKey, {
        date: dateKey,
        displayDate,
        games: [],
        totalGames: 0,
        allPlayerNames: new Set<string>(),
      });
    }

    const dateGroup = dateGroups.get(dateKey)!;

    const gameSummary: GameDateGameEntry = {
      id: game.id,
      gameIdentifier: game.gameIdentifier,
    };

    if (includePlayers) {
      const playerNames = namesByGameId.get(game.id) ?? [];
      gameSummary.allPlayerNames = playerNames;
      playerNames.forEach((name) => dateGroup.allPlayerNames.add(name));
    }

    dateGroup.games.push(gameSummary);
    dateGroup.totalGames++;
  });

  const datesList: GameDateEntry[] = Array.from(dateGroups.values())
    .map((dg) => ({
      date: dg.date,
      displayDate: dg.displayDate,
      totalGames: dg.totalGames,
      games: dg.games.map((g) => ({
        id: g.id,
        gameIdentifier: g.gameIdentifier,
        ...(includePlayers && g.allPlayerNames
          ? { allPlayerNames: g.allPlayerNames }
          : {}),
      })),
      ...(includePlayers
        ? { allPlayerNames: Array.from(dg.allPlayerNames).sort() }
        : {}),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return { dates: datesList, totalDates: datesList.length };
}
