'use server';

import { getPlayerRankingHistory } from '../../_services/players/getPlayerRankingHistory';

export async function loadComparisonRanking(playerName: string, seasonId: number) {
  return getPlayerRankingHistory(playerName, seasonId);
}
