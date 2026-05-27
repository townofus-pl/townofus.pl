import { getDatabaseClient } from '../db';
import { chunkedInQuery } from '@/app/api/_database';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { Teams } from '@/constants/teams';
import type { UserProfileStats } from './types';
import { determineTeam } from '@/app/dramaafera/_utils/gameUtils';

// Get user profile statistics from database.
// Implementation note: heavy players accumulate hundreds of stat rows over a
// season; a nested `include: { roleHistory }` on the stats fetch emits
// `WHERE gamePlayerStatisticsId IN (?,…,?N)` which trips D1's 98-param cap on
// Prisma 7 (P2029). We fetch stats and their relations separately in chunks.
export async function getUserProfileStats(playerName: string, seasonId?: number): Promise<UserProfileStats | null> {
  const prisma = await getDatabaseClient();
  if (!prisma) return null;

  const player = await prisma.player.findFirst({
    where: { name: playerName, ...withoutDeleted },
    select: { id: true },
  });
  if (!player) return null;

  const season = seasonId ?? CURRENT_SEASON;

  // Stats for this player in this season (no relations on the include).
  const stats = await prisma.gamePlayerStatistics.findMany({
    where: {
      playerId: player.id,
      game: { season, ...withoutDeleted },
    },
    select: {
      id: true,
      gameId: true,
      win: true,
      completedTasks: true,
      correctKills: true,
      incorrectKills: true,
      correctGuesses: true,
      incorrectGuesses: true,
      correctProsecutes: true,
      incorrectProsecutes: true,
      correctDeputyShoots: true,
      incorrectDeputyShoots: true,
      correctJailorExecutes: true,
      incorrectJailorExecutes: true,
      correctMedicShields: true,
      incorrectMedicShields: true,
      correctWardenFortifies: true,
      incorrectWardenFortifies: true,
      janitorCleans: true,
      survivedRounds: true,
      correctAltruistRevives: true,
      incorrectAltruistRevives: true,
      correctSwaps: true,
      incorrectSwaps: true,
    },
  });

  if (stats.length === 0) return null;

  const statIds = stats.map((s) => s.id);
  const uniqueGameIds = Array.from(new Set(stats.map((s) => s.gameId)));

  // Primary role per stat (order === 0)
  const primaryRoles = await chunkedInQuery(statIds, (chunk) =>
    prisma.playerRole.findMany({
      where: { gamePlayerStatisticsId: { in: chunk }, order: 0 },
      select: { gamePlayerStatisticsId: true, roleName: true },
    }),
  );
  const primaryRoleByStatId = new Map(
    primaryRoles.map((r) => [r.gamePlayerStatisticsId, r.roleName]),
  );

  // game.maxTasks per gameId
  const games = await chunkedInQuery(uniqueGameIds, (chunk) =>
    prisma.game.findMany({
      where: { id: { in: chunk } },
      select: { id: true, maxTasks: true },
    }),
  );
  const maxTasksByGameId = new Map(games.map((g) => [g.id, g.maxTasks ?? 0]));

  let gamesPlayed = 0;
  let wins = 0;
  let impostorGames = 0;
  let crewmateGames = 0;
  let neutralGames = 0;
  let totalTasks = 0;
  let maxTasks = 0;
  let correctKills = 0;
  let incorrectKills = 0;
  let correctGuesses = 0;
  let incorrectGuesses = 0;
  let correctProsecutes = 0;
  let incorrectProsecutes = 0;
  let correctDeputyShoots = 0;
  let incorrectDeputyShoots = 0;
  let correctJailorExecutes = 0;
  let incorrectJailorExecutes = 0;
  let correctMedicShields = 0;
  let incorrectMedicShields = 0;
  let correctWardenFortifies = 0;
  let incorrectWardenFortifies = 0;
  let janitorCleans = 0;
  let survivedRounds = 0;
  let totalRounds = 0;
  let correctAltruistRevives = 0;
  let incorrectAltruistRevives = 0;
  let correctSwaps = 0;
  let incorrectSwaps = 0;

  stats.forEach((stat) => {
    gamesPlayed++;
    if (stat.win) wins++;

    const primaryRole = primaryRoleByStatId.get(stat.id) ?? '';
    const teamName = determineTeam(primaryRole);

    if (teamName === Teams.Impostor) impostorGames++;
    else if (teamName === Teams.Neutral) neutralGames++;
    else crewmateGames++;

    totalTasks += stat.completedTasks || 0;
    if (teamName === Teams.Crewmate) {
      maxTasks += maxTasksByGameId.get(stat.gameId) ?? 0;
    }
    correctKills += stat.correctKills || 0;
    incorrectKills += stat.incorrectKills || 0;
    correctGuesses += stat.correctGuesses || 0;
    incorrectGuesses += stat.incorrectGuesses || 0;
    correctProsecutes += stat.correctProsecutes || 0;
    incorrectProsecutes += stat.incorrectProsecutes || 0;
    correctDeputyShoots += stat.correctDeputyShoots || 0;
    incorrectDeputyShoots += stat.incorrectDeputyShoots || 0;
    correctJailorExecutes += stat.correctJailorExecutes || 0;
    incorrectJailorExecutes += stat.incorrectJailorExecutes || 0;
    correctMedicShields += stat.correctMedicShields || 0;
    incorrectMedicShields += stat.incorrectMedicShields || 0;
    correctWardenFortifies += stat.correctWardenFortifies || 0;
    incorrectWardenFortifies += stat.incorrectWardenFortifies || 0;
    janitorCleans += stat.janitorCleans || 0;
    survivedRounds += stat.survivedRounds || 0;
    correctAltruistRevives += stat.correctAltruistRevives || 0;
    incorrectAltruistRevives += stat.incorrectAltruistRevives || 0;
    correctSwaps += stat.correctSwaps || 0;
    incorrectSwaps += stat.incorrectSwaps || 0;

    totalRounds += (stat.survivedRounds || 0) + (stat.win ? 0 : 1);
  });

  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

  return {
    name: playerName,
    gamesPlayed,
    wins,
    winRate,
    impostorGames,
    crewmateGames,
    neutralGames,
    totalTasks,
    maxTasks,
    correctKills,
    incorrectKills,
    correctGuesses,
    incorrectGuesses,
    correctProsecutes,
    incorrectProsecutes,
    correctDeputyShoots,
    incorrectDeputyShoots,
    correctJailorExecutes,
    incorrectJailorExecutes,
    correctMedicShields,
    incorrectMedicShields,
    correctWardenFortifies,
    incorrectWardenFortifies,
    janitorCleans,
    survivedRounds,
    totalRounds,
    correctAltruistRevives,
    incorrectAltruistRevives,
    correctSwaps,
    incorrectSwaps,
  };
}
