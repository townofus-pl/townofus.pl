export function getWinRatioColor(winRatio: number): string {
  const percentage = Number.isFinite(winRatio) ? Math.min(100, Math.max(0, winRatio)) : 0;
  return `hsl(${percentage * 1.2}, 75%, 60%)`;
}
