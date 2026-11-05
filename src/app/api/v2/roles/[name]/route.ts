import { generateRoleRankingSummary, getAllGamesData } from '@/app/dramaafera/_services';
import { convertUrlSlugToRole, isKnownRole, normalizeRoleName, getRoleColor, determineTeam, convertRoleNameForDisplay } from '@/app/dramaafera/_utils/gameUtils';
import { generateRoleStats } from '@/app/dramaafera/role/[nazwa]/_generateRoleStats';
import { getRoleTopPerformances } from '@/app/dramaafera/role/[nazwa]/_getRoleTopPerformances';
import { Teams } from '@/constants/teams';
import { RoleResponseSchema } from '../../_lib/schemas';
import { ApiError, publicGet, preflight, seasonParam, intParam } from '../../_lib/http';
import { toPublicRole } from '../_role';

export const OPTIONS = preflight;

// Strona roli. `{name}` to nazwa roli albo slug, np. `soul-collector`.
export const GET = publicGet(
  RoleResponseSchema,
  async (request, { params }: { params: Promise<{ name: string }> }) => {
    const slug = decodeURIComponent((await params).name);
    const season = seasonParam(request);
    const limit = intParam(request, 'limit', 50, { min: 1, max: 500 });

    const roleName = normalizeRoleName(convertUrlSlugToRole(slug, []), season);
    if (!isKnownRole(roleName, season)) throw new ApiError(404, 'Nie znaleziono roli');

    const [summaries, games] = await Promise.all([
      generateRoleRankingSummary(season, undefined, undefined, { excludeLatestDay: true }),
      getAllGamesData(season, roleName),
    ]);
    const summary = summaries.find((row) => normalizeRoleName(row.name, season) === roleName);
    const stats = generateRoleStats(games, roleName, season);
    const performances = getRoleTopPerformances(games, roleName, (role) => normalizeRoleName(role, season));

    const team = determineTeam([roleName], season);
    const role = toPublicRole(summary ?? {
      name: roleName,
      displayName: convertRoleNameForDisplay(roleName),
      color: getRoleColor(roleName, season),
      team: team === Teams.Impostor ? 'Impostor' : team === Teams.Neutral ? 'Neutral' : 'Crewmate',
      gamesPlayed: 0,
      wins: 0,
      winRate: 0,
      dapGames: 0,
      totalPoints: 0,
      averagePoints: 0,
    });

    return {
      season,
      role: { ...role, totalAppearances: stats.totalAppearances },
      players: stats.players.map((p) => ({
        player: p.name, gamesPlayed: p.gamesWithRole, wins: p.winsWithRole, winRate: p.winRateWithRole,
      })),
      topPerformances: performances.slice(0, limit).map((row) => ({
        gameId: row.gameId, date: row.date, map: row.map, duration: row.duration, player: row.playerName, win: row.win,
      })),
    };
  },
);
