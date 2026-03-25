import { getDatabaseClient, buildSeasonGameWhere } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';

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

export async function getGameDatesLightweight(
  includePlayers = false,
  seasonId?: number,
): Promise<GameDatesResult> {
  const prisma = await getDatabaseClient();
  if (!prisma) return { dates: [], totalDates: 0 };

  const where = buildSeasonGameWhere(seasonId);

  const games = includePlayers
    ? await prisma.game.findMany({
        where,
        select: {
          id: true,
          gameIdentifier: true,
          startTime: true,
          gamePlayerStatistics: {
            where: { player: withoutDeleted },
            include: {
              player: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { startTime: 'desc' },
      })
    : await prisma.game.findMany({
        where,
        select: {
          id: true,
          gameIdentifier: true,
          startTime: true,
        },
        orderBy: { startTime: 'desc' },
      });

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

  const polishMonths = [
    '',
    'stycznia',
    'lutego',
    'marca',
    'kwietnia',
    'maja',
    'czerwca',
    'lipca',
    'sierpnia',
    'września',
    'października',
    'listopada',
    'grudnia',
  ];

  games.forEach((game) => {
    let dateKey = '';
    let displayDate = '';

    if (game.gameIdentifier) {
      const datePart = game.gameIdentifier.split('_')[0];
      if (datePart && datePart.length === 8) {
        dateKey = datePart;
        const year = datePart.substring(0, 4);
        const month = parseInt(datePart.substring(4, 6));
        const day = parseInt(datePart.substring(6, 8));
        displayDate = `${day} ${polishMonths[month]} ${year}`;
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

    if (
      includePlayers &&
      'gamePlayerStatistics' in game &&
      game.gamePlayerStatistics
    ) {
      const playerNames = (
        game.gamePlayerStatistics as Array<{ player: { name: string } }>
      ).map((stat) => stat.player.name);
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
