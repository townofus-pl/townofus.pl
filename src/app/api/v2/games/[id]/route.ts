import { getGameData, toPublicGameData } from '@/app/dramaafera/_services';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { GameResponseSchema } from '../../_lib/schemas';
import { ApiError, publicGet, preflight, optionalSeasonParam } from '../../_lib/http';
import { buildGroupedCounters } from '../../_lib/counters';
import { buildPlayerActionStats, emptyPlayerActionStats, getGameActionRows } from '../../_lib/gameActions';

export const OPTIONS = preflight;

// Strona gry bez zdarzeń. Bez `?season=` zwraca grę z dowolnego sezonu.
// Z `?season=` sprawdza, czy gra należy do tego sezonu.
export const GET = publicGet(
  GameResponseSchema,
  async (request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const season = optionalSeasonParam(request);

    const full = await getGameData(id);
    if (!full || (season !== undefined && full.season !== season)) throw new ApiError(404, 'Nie znaleziono gry');

    // Kolejność graczy jak na stronie gry: ostatni dzień alfabetycznie, starsza gra „Standardowo”.
    const game = toPublicGameData(full, { displayOrder: true });
    const gameSeason = game.season ?? CURRENT_SEASON;
    const hasTimeline = game.detailedStats.hasTimeline ?? false;
    const actionStats = hasTimeline ? buildPlayerActionStats(await getGameActionRows(id), gameSeason) : null;

    return {
      season: game.season ?? null,
      id: game.id,
      date: game.date,
      startTime: game.startTime,
      endTime: game.endTime,
      duration: game.duration,
      map: game.map,
      winner: game.winner,
      winCondition: game.winCondition,
      winnerNames: game.winnerNames,
      maxTasks: game.maxTasks ?? null,
      players: game.detailedStats.playersData.map((player) => {
        const own = actionStats ? (actionStats.get(player.nickname) ?? emptyPlayerActionStats()) : null;
        const stats = player.originalStats;
        return {
          player: player.nickname,
          role: player.role,
          roleHistory: player.roleHistory ?? [],
          modifiers: player.modifiers,
          team: player.team,
          win: player.win,
          survived: player.survived,
          completedTasks: player.completedTasks,
          survivedRounds: player.survivedRounds,
          counters: buildGroupedCounters(stats, {
            season: gameSeason,
            role: stats.roleHistory.at(-1) ?? player.role,
            protectTypes: own?.protectTypes ?? null,
            guessTypes: own?.guessTypes ?? null,
            votes: own ? { correct: stats.correctVotes ?? 0, incorrect: stats.incorrectVotes ?? 0 } : null,
          }),
          actions: own?.actions ?? null,
        };
      }),
      meetings: game.detailedStats.meetings,
      hasTimeline,
    };
  },
);
