import type { RankingHistoryPoint } from '../../_services/players/types';

export function filterRankingHistory(history: RankingHistoryPoint[], dateFrom: string, dateTo: string) {
  const sorted = [...history].sort((a, b) => a.date.getTime() - b.date.getTime());
  if (!dateFrom && !dateTo) return sorted;
  const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : -Infinity;
  const to = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : Infinity;
  const filtered = sorted.filter(point => point.date.getTime() >= from && point.date.getTime() <= to);
  const previous = sorted.filter(point => point.date.getTime() < from).at(-1);
  return previous && filtered.length > 0 ? [previous, ...filtered] : filtered;
}
