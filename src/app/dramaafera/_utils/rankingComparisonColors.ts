export function getRankingComparisonColor(index: number): string {
  const colors = ['rgb(34, 211, 238)', '#F472B6', '#A78BFA', '#4ADE80', '#FB923C', '#60A5FA'];
  return colors[index] ?? `hsl(${(index * 137.508) % 360} 75% 65%)`;
}
