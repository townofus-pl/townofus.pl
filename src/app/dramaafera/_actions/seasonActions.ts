'use server';

import { getPublicSessionSummaryByDate, getHostInfo, getRanking, getLatestEmperorId, getGameDatesLightweight, getSeasonRankingHistories } from '@/app/dramaafera/_services';
import { requireHostAuth } from './_requireHostAuth';

// Akcja serwera do pobierania wyników sesji dla danej daty i sezonu.
// Publiczna: oddaje typ publiczny, bez pól punktowych.
export async function getSessionResults(date: string, seasonId: number) {
  return getPublicSessionSummaryByDate(date, seasonId);
}

// Akcja serwera do pobierania informacji hosta dla danej daty i sezonu.
// Dane hosta są prywatne, więc akcja wymaga logowania.
export async function getHostInfoAction(date: string, seasonId: number) {
  await requireHostAuth();
  return getHostInfo(date, seasonId);
}

// Akcja serwera do pobierania rankingu dla danego sezonu (używana do auto-odświeżania)
export async function getRankingAction(seasonId: number) {
  const [{ ranking }, latestEmperorId] = await Promise.all([
    getRanking(seasonId),
    getLatestEmperorId(seasonId),
  ]);
  return { ranking, latestEmperorId };
}

export async function getSeasonRankingHistoriesAction(seasonId: number) {
  return getSeasonRankingHistories(seasonId);
}

// Akcja serwera do pobierania listy dat gier dla danego sezonu
export async function getGameDatesAction(seasonId: number) {
  return getGameDatesLightweight(false, seasonId);
}
