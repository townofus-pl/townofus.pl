import { getGameData } from '@/app/dramaafera/_services';
import { GameEventsResponseSchema } from '../../../_lib/schemas';
import { ApiError, publicGet, preflight, optionalSeasonParam } from '../../../_lib/http';

export const OPTIONS = preflight;

// Oś czasu jednej gry. Zdarzenia przechodzą ten sam filtr ukrytych akcji co strona gry
// (`buildGameTimeline`). Bez `?season=` trasa zwraca grę z dowolnego sezonu.
export const GET = publicGet(
  GameEventsResponseSchema,
  async (request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const season = optionalSeasonParam(request);

    const game = await getGameData(id);
    if (!game || (season !== undefined && game.season !== season)) throw new ApiError(404, 'Nie znaleziono gry');

    return {
      id: game.id,
      events: game.detailedStats.events.map((event) => ({
        timestamp: event.timestamp,
        type: event.actionType ?? event.type,
        player: event.player,
        playerRole: event.playerRole,
        target: event.target,
        targetRole: event.targetRole,
        actionLabel: event.actionLabel,
        isCorrect: event.isCorrect,
        causeOfDeath: event.causeOfDeath,
        isGuess: event.isGuess,
        guessedRole: event.guessedRole,
        guessedModifier: event.guessedModifier,
        // Zabójstwo ma `killAbility`, reszta `ability`. W API to jedno pole.
        ability: event.killAbility ?? event.ability,
        survivors: event.survivors,
      })),
    };
  },
);
