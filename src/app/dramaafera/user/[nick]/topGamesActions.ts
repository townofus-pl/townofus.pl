'use server';

import { getPlayerTopGames } from '../../_services/players/getPlayerTopGames';

export async function loadMoreTopGames(playerName: string | number, seasonId: number, offset: number) {
  if (!Number.isInteger(offset) || offset < 3 || !Number.isInteger(seasonId)) {
    throw new Error('Nieprawidłowe parametry listy gier');
  }
  return getPlayerTopGames(playerName, offset === 3 ? 7 : 10, seasonId, offset);
}
