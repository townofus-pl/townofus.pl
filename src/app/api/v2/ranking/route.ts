import { getRanking, getLatestEmperorId } from '@/app/dramaafera/_services';
import { getDatabaseClient } from '@/app/dramaafera/_services/db';
import { RankingResponseSchema } from '../_lib/schemas';
import { publicGet, preflight, seasonParam, intParam } from '../_lib/http';

export const OPTIONS = preflight;

// Ranking jak na stronie `ranking`: `dap` bez ostatniego dnia z grami, Cesarz jak na stronie.
export const GET = publicGet(RankingResponseSchema, async (request) => {
  const season = seasonParam(request);
  const limit = intParam(request, 'limit', 50, { min: 1, max: 200 });
  const offset = intParam(request, 'offset', 0, { max: 10_000 });

  const [{ ranking }, emperorId] = await Promise.all([getRanking(season, limit, offset), getLatestEmperorId(season)]);

  let emperor: string | null = ranking.find((player) => player.playerId === emperorId)?.playerName ?? null;
  if (emperorId !== null && emperor === null) {
    const prisma = await getDatabaseClient();
    emperor = (await prisma?.player.findUnique({ where: { id: emperorId }, select: { name: true } }))?.name ?? null;
  }

  return {
    season,
    limit,
    offset,
    emperor,
    players: ranking.map((player) => ({
      rank: player.rank,
      player: player.playerName,
      rating: player.currentRating,
      dap: player.dap,
      gamesPlayed: player.totalGames,
      wins: player.wins,
      losses: player.losses,
      winRate: player.winRate,
      lastUpdated: player.lastUpdated,
    })),
  };
});
