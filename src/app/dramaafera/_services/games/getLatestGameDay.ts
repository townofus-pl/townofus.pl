import { cache } from 'react';
import { getDatabaseClient } from '../db';

export interface LatestGameDay {
  /** YYYY-MM-DD, ta sama data graniczna co przy opóźnionej wartości DAP. */
  date: string;
  gameIds: number[];
}

/**
 * Ostatni dzień z grami w sezonie. Reguła jest ta sama co w `getRanking`
 * i w tabeli ról: `MAX(SUBSTR(startTime, 1, 10))` z gier sezonu bez usuniętych.
 */
// `cache()`: jedno zapytanie na sezon w jednym żądaniu, nawet gdy sesja ma 12 gier.
export const getLatestGameDay = cache(async function getLatestGameDay(season: number): Promise<LatestGameDay | null> {
  const prisma = await getDatabaseClient();
  if (!prisma) return null;

  const [row] = await prisma.$queryRaw<{ date: string | null }[]>`
    SELECT MAX(SUBSTR(startTime, 1, 10)) AS date FROM games
    WHERE season = ${season} AND deletedAt IS NULL
  `;
  if (!row?.date) return null;

  const games = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id FROM games
    WHERE season = ${season} AND deletedAt IS NULL AND SUBSTR(startTime, 1, 10) = ${row.date}
  `;
  return { date: row.date, gameIds: games.map((game) => Number(game.id)) };
});
