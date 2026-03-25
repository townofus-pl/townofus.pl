'use server';

import { getSessionSummaryByDate, getHostInfo, getRanking, getGameDatesLightweight } from '@/app/dramaafera/_services';

// Akcja serwera do pobierania wyników sesji dla danej daty i sezonu
export async function getSessionResults(date: string, seasonId: number) {
  return getSessionSummaryByDate(date, seasonId);
}

// Akcja serwera do pobierania informacji hosta dla danej daty i sezonu
export async function getHostInfoAction(date: string, seasonId: number) {
  return getHostInfo(date, seasonId);
}

// Akcja serwera do pobierania rankingu dla danego sezonu (używana do auto-odświeżania)
export async function getRankingAction(seasonId: number) {
  return getRanking(seasonId);
}

// Akcja serwera do pobierania listy dat gier dla danego sezonu
export async function getGameDatesAction(seasonId: number) {
  return getGameDatesLightweight(false, seasonId);
}
