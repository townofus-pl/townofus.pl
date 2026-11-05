import { chunkedInQuery } from '@/app/api/_database';
import { getDatabaseClient } from '@/app/dramaafera/_services/db';
import { withoutDeleted } from '@/app/api/schema/common';
import { ACTION_COUNT_KEYS } from './subtypes';
import {
  emptyPair,
  emptyProtectTypes,
  protectSubtypeForRole,
  type GuessTypes,
  type Pair,
  type ProtectTypes,
} from './counters';

export interface ActionRow {
  type: string;
  performerRole: string;
  isCorrect: boolean | null;
  detail: string | null;
  performer: { name: string };
}

/** Wszystkie akcje jednej gry. Jedno zapytanie na żądanie `GET /api/v2/games/{id}`. */
export async function getGameActionRows(gameIdentifier: string): Promise<ActionRow[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];
  return prisma.gameAction.findMany({
    where: { ...withoutDeleted, performer: withoutDeleted, game: { gameIdentifier, ...withoutDeleted } },
    select: { type: true, performerRole: true, isCorrect: true, detail: true, performer: { select: { name: true } } },
  });
}

export interface PlayerActionStats {
  protectTypes: ProtectTypes;
  guessTypes: GuessTypes;
  actions: Record<(typeof ACTION_COUNT_KEYS)[number], number>;
}

function readDetail(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function add(target: Pair, isCorrect: boolean | null) {
  // Jak liczniki: `null` nie jest ani correct, ani incorrect.
  if (isCorrect === true) target.correct += 1;
  else if (isCorrect === false) target.incorrect += 1;
}

const emptyActions = () =>
  Object.fromEntries(ACTION_COUNT_KEYS.map((key) => [key, 0])) as PlayerActionStats['actions'];

/** Podtypy i liczby akcji dla każdego gracza gry, z akcji gry. */
export function buildPlayerActionStats(rows: ActionRow[], season: number): Map<string, PlayerActionStats> {
  const out = new Map<string, PlayerActionStats>();
  const statsFor = (name: string) => {
    let stats = out.get(name);
    if (!stats) {
      stats = { protectTypes: emptyProtectTypes(), guessTypes: { roles: emptyPair(), modifiers: emptyPair() }, actions: emptyActions() };
      out.set(name, stats);
    }
    return stats;
  };

  for (const row of rows) {
    const stats = statsFor(row.performer.name);
    if ((ACTION_COUNT_KEYS as readonly string[]).includes(row.type)) {
      stats.actions[row.type as keyof PlayerActionStats['actions']] += 1;
    }
    if (row.type === 'protect') {
      const subtype = protectSubtypeForRole(row.performerRole, season);
      if (subtype) add(stats.protectTypes[subtype], row.isCorrect);
    }
    if (row.type === 'kill') {
      const detail = readDetail(row.detail);
      if (detail.isGuess === true) {
        if (typeof detail.guessedRole === 'string') add(stats.guessTypes.roles, row.isCorrect);
        if (typeof detail.guessedModifier === 'string') add(stats.guessTypes.modifiers, row.isCorrect);
      }
    }
  }
  return out;
}

export function emptyPlayerActionStats(): PlayerActionStats {
  return { protectTypes: emptyProtectTypes(), guessTypes: { roles: emptyPair(), modifiers: emptyPair() }, actions: emptyActions() };
}

export interface PlayerActionRow extends ActionRow {
  /** Id gry w bazie, do przypisania akcji do roli gracza w tej grze. */
  gameId: number;
}

/**
 * Akcje `protect` i `kill` jednego gracza w podanych grach (sezon 4+). Indeks (gameId, type) czyta
 * akcje `protect` i `kill` wszystkich graczy z tych gier, a `performerId` zostawia z nich tylko akcje
 * tego gracza (to pole nie ma własnego indeksu). Akcje z gier, w których gracz nie grał, nie są czytane.
 */
export async function getPlayerActionRows(playerName: string, gameIds: number[]): Promise<PlayerActionRow[]> {
  if (gameIds.length === 0) return [];
  const prisma = await getDatabaseClient();
  if (!prisma) return [];
  const player = await prisma.player.findFirst({ where: { name: playerName, ...withoutDeleted }, select: { id: true } });
  if (!player) return [];
  return chunkedInQuery(gameIds, (chunk) =>
    prisma.gameAction.findMany({
      where: { gameId: { in: chunk }, type: { in: ['protect', 'kill'] }, performerId: player.id, ...withoutDeleted },
      select: { gameId: true, type: true, performerRole: true, isCorrect: true, detail: true, performer: { select: { name: true } } },
    }),
  );
}

/** Podtypy ochron i zgadnięć z akcji jednego gracza, dla podanych gier. */
export function playerSubtypes(rows: PlayerActionRow[], gameIds: ReadonlySet<number> | null, season: number): { protectTypes: ProtectTypes; guessTypes: GuessTypes } {
  const own = gameIds ? rows.filter((row) => gameIds.has(row.gameId)) : rows;
  const grouped = new Map<string, ActionRow[]>();
  for (const row of own) grouped.set('player', [...(grouped.get('player') ?? []), { ...row, performer: { name: 'player' } }]);
  const stats = buildPlayerActionStats(grouped.get('player') ?? [], season).get('player');
  return stats ? { protectTypes: stats.protectTypes, guessTypes: stats.guessTypes } : emptyPlayerActionStats();
}
