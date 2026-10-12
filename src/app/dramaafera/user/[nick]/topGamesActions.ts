'use server';

import { getPlayerTopGames } from '../../_services/players/getPlayerTopGames';
import { TOP_GAMES_INITIAL, TOP_GAMES_PAGE } from './topGamesConfig';

export async function loadMoreTopGames(playerName: string, seasonId: number, offset: number) {
  if (!Number.isInteger(offset) || offset < TOP_GAMES_INITIAL || !Number.isInteger(seasonId)) {
    throw new Error('Nieprawidłowe parametry listy gier');
  }
  return getPlayerTopGames(playerName, offset === TOP_GAMES_INITIAL ? TOP_GAMES_PAGE - TOP_GAMES_INITIAL : TOP_GAMES_PAGE, seasonId, offset);
}
