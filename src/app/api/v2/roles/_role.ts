import type { RoleRankingSummary } from '@/app/dramaafera/_services';

/** Jawne mapowanie wiersza roli. Wartości DAP zmieniają nazwę na `dap` i `averageDap`. */
export function toPublicRole(role: RoleRankingSummary) {
  return {
    name: role.name,
    displayName: role.displayName,
    color: role.color,
    team: role.team,
    gamesPlayed: role.gamesPlayed,
    wins: role.wins,
    // Jedno miejsce po przecinku. Tabela ról na stronie zaokrągla do całości i tego nie zmieniamy.
    winRate: role.gamesPlayed > 0 ? Number(((role.wins / role.gamesPlayed) * 100).toFixed(1)) : 0,
    dapGames: role.dapGames,
    dap: role.totalPoints,
    averageDap: role.averagePoints,
  };
}
