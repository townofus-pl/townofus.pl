import { Teams } from '@/constants/teams';

export const FACTION_TARGETS = {
  [Teams.Crewmate]: 0.5,
  [Teams.Impostor]: 0.3,
  [Teams.Neutral]: 0.2,
} as const;

export type ProbabilityTeam = keyof typeof FACTION_TARGETS;
export const ROLE_PROBABILITY_K = 2;

export interface RoleProbabilityData {
  games: number;
  unknownWins: number;
  factions: Array<{ team: ProbabilityTeam; wins: number; winRate: number; target: number }>;
  roles: Array<{
    name: string;
    color: string;
    team: ProbabilityTeam;
    games: number;
    wins: number;
    winRate: number | null;
    weight: number;
  }>;
}

/** Rates and returned weight are fractions; base weight = 0.5. */
export function calculateRoleWeight(factionRate: number, target: number, roleRate: number): number {
  return Math.max(0, Math.min(1, 0.5 - ROLE_PROBABILITY_K * (factionRate - target) * (roleRate - factionRate)));
}
