'use server';

import { getPlayerRankingHistory } from '../../_services/players/getPlayerRankingHistory';
import { getRankingComparisonPlayers } from '../../_services/players/getRankingComparisonPlayers';

export async function loadComparisonPlayers(seasonId: number) {
  if (!Number.isInteger(seasonId)) throw new Error('Nieprawidłowy sezon');
  return getRankingComparisonPlayers(seasonId);
}

export async function loadComparisonRanking(playerName: string, seasonId: number) {
  return getPlayerRankingHistory(playerName, seasonId);
}
