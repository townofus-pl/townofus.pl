import { getDatabaseClient } from '../db';
import { Teams } from '@/constants/teams';
import { CURRENT_SEASON, FIRST_MIRA_SEASON } from '../../_constants/seasons';
import { LEGACY_ROLE_INDEX, MIRA_ROLE_INDEX } from '@/roles/_generated/roleIndex';
import { normalizeRoleName, determineTeam, getRoleColor } from '../../_utils/gameUtils';
import { calculateWinnerFromStats } from '../games/winCalculator';
import { FACTION_SAMPLE_SIZE, FACTION_TARGETS, calculateRoleWeight, hasCompleteFactionSample, type ProbabilityTeam, type RoleProbabilityData } from '../../_utils/roleProbabilities';

interface AppearanceRow {
  gameId: number;
  win: number | boolean;
  initialRole: string | null;
  finalRole: string | null;
  lover: number;
}

export async function getRoleProbabilities(season = CURRENT_SEASON): Promise<RoleProbabilityData> {
  const prisma = await getDatabaseClient();
  // Initial roles still span the season: a rare role's last 20 games may be old.
  // Final roles and modifiers are only needed for the latest 20 faction results.
  const rows = prisma ? await prisma.$queryRaw<AppearanceRow[]>`
    WITH recent_games AS MATERIALIZED (
      SELECT g.id FROM games g WHERE g.season = ${season} AND g.deletedAt IS NULL
        AND EXISTS (SELECT 1 FROM game_player_statistics gps JOIN players p ON p.id = gps.playerId
                    WHERE gps.gameId = g.id AND p.deletedAt IS NULL)
      ORDER BY g.startTime DESC, g.id DESC LIMIT ${FACTION_SAMPLE_SIZE}
    )
    SELECT g.id AS gameId, gps.win,
      (SELECT r.roleName FROM player_roles r WHERE r.gamePlayerStatisticsId = gps.id
       ORDER BY r."order" ASC LIMIT 1) AS initialRole,
      CASE WHEN recent.id IS NOT NULL THEN
        (SELECT r.roleName FROM player_roles r WHERE r.gamePlayerStatisticsId = gps.id
         ORDER BY r."order" DESC LIMIT 1) ELSE NULL END AS finalRole,
      CASE WHEN recent.id IS NOT NULL THEN
        EXISTS(SELECT 1 FROM player_modifiers m WHERE m.gamePlayerStatisticsId = gps.id
               AND LOWER(m.modifierName) = 'lover') ELSE 0 END AS lover
    FROM games g
    JOIN game_player_statistics gps ON gps.gameId = g.id
    JOIN players p ON p.id = gps.playerId
    LEFT JOIN recent_games recent ON recent.id = g.id
    WHERE g.season = ${season} AND g.deletedAt IS NULL AND p.deletedAt IS NULL
    ORDER BY g.startTime DESC, g.id DESC, gps.id ASC
  ` : [];
  return buildRoleProbabilities(rows, season);
}

export function buildRoleProbabilities(rows: AppearanceRow[], season: number): RoleProbabilityData {
  const teams = Object.keys(FACTION_TARGETS) as ProbabilityTeam[];
  const games = new Map<number, AppearanceRow[]>();
  for (const row of rows) {
    const game = games.get(row.gameId) ?? [];
    game.push(row);
    games.set(row.gameId, game);
  }
  const recent = [...games.values()].slice(0, FACTION_SAMPLE_SIZE);
  const factionWins = new Map<ProbabilityTeam, number>(teams.map(team => [team, 0]));
  let unknownWins = 0;
  for (const game of recent) {
    const result = calculateWinnerFromStats(game.map(row => ({
      win: Boolean(row.win),
      roleHistory: row.finalRole ? [{ roleName: row.finalRole, order: 0 }] : [],
      modifiers: row.lover ? [{ modifierName: 'lover' }] : [],
    })), season);
    const team: ProbabilityTeam | null = result.winner === 'Crewmate' ? Teams.Crewmate
      : result.winner === 'Impostor' ? Teams.Impostor
        : result.winner === 'Unknown' ? null : Teams.Neutral;
    if (team) factionWins.set(team, (factionWins.get(team) ?? 0) + 1);
    else unknownWins++;
  }
  const completeFactionSample = hasCompleteFactionSample({ games: recent.length, unknownWins });
  const factions: RoleProbabilityData['factions'] = teams.map(team => ({
    team, wins: factionWins.get(team) ?? 0,
    winRate: recent.length ? (factionWins.get(team) ?? 0) / recent.length : 0,
    target: FACTION_TARGETS[team],
  }));
  const samples = new Map<string, { team: ProbabilityTeam; color: string; results: boolean[] }>();
  const registry = season >= FIRST_MIRA_SEASON ? MIRA_ROLE_INDEX : LEGACY_ROLE_INDEX;
  for (const role of registry) {
    if (teams.includes(role.team as ProbabilityTeam)) {
      samples.set(normalizeRoleName(role.name, season), {
        team: role.team as ProbabilityTeam, color: role.color, results: [],
      });
    }
  }
  for (const game of games.values()) {
    // A role is sampled once per match, even if multiple players started with it.
    const results = new Map<string, boolean>();
    for (const row of game) {
      if (!row.initialRole) continue;
      const name = normalizeRoleName(row.initialRole, season);
      const team = determineTeam(row.initialRole, season) as ProbabilityTeam;
      if (!teams.includes(team)) continue;
      if (!samples.has(name)) samples.set(name, { team, color: getRoleColor(row.initialRole, season), results: [] });
      results.set(name, (results.get(name) ?? false) || Boolean(row.win));
    }
    for (const [name, win] of results) {
      const sample = samples.get(name)!;
      if (sample.results.length < 20) sample.results.push(win);
    }
  }
  return {
    games: recent.length, unknownWins, factions,
    roles: [...samples].map<RoleProbabilityData['roles'][number]>(([name, sample]) => {
      const wins = sample.results.filter(Boolean).length;
      const winRate = sample.results.length ? wins / sample.results.length : null;
      const faction = factions.find(item => item.team === sample.team)!;
      return {
        name, team: sample.team, color: sample.color, games: sample.results.length, wins, winRate,
        weight: completeFactionSample && sample.results.length >= 10 && winRate !== null
          ? calculateRoleWeight(faction.winRate, faction.target, winRate) : 0.5,
      };
    }).sort((a, b) => a.name.localeCompare(b.name, 'pl')),
  };
}
