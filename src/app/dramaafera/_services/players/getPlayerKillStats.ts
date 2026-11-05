import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';

export interface KillStatistics {
  available: boolean;
  kills: number;
  killed: number;
  targets: { playerName: string; count: number }[];
  killers: { playerName: string; count: number }[];
}

type Category = 'kills' | 'guesses' | 'protects';
type ActionRow = {
  type: string; performerId: number; targetId: number; performerRole: string;
  detail: string | null; isCorrect: number | boolean | null;
  performerName: string; targetName: string;
};

export async function getPlayerActionStats(nick: string, seasonId: number): Promise<Record<Category, KillStatistics>> {
  const empty = (): KillStatistics => ({ available: false, kills: 0, killed: 0, targets: [], killers: [] });
  const result = { kills: empty(), guesses: empty(), protects: empty() };
  const prisma = await getDatabaseClient();
  if (!prisma) return result;
  const player = await prisma.player.findFirst({ where: { name: nick, ...withoutDeleted }, select: { id: true } });
  if (!player) return result;

  // One season scan for both action types. Filter by player before resolving names;
  // the existing (gameId, type) index supports this without large IN parameter lists.
  const actions = await prisma.$queryRaw<ActionRow[]>`
    SELECT a.type, a.performerId, a.targetId, a.performerRole, a.detail, a.isCorrect,
           performer.name AS performerName, target.name AS targetName
    FROM games g
    JOIN game_actions a ON a.gameId = g.id AND a.type IN ('kill', 'protect')
    JOIN players performer ON performer.id = a.performerId AND performer.deletedAt IS NULL
    JOIN players target ON target.id = a.targetId AND target.deletedAt IS NULL
    WHERE g.season = ${seasonId} AND g.deletedAt IS NULL AND a.deletedAt IS NULL
      AND (a.performerId = ${player.id} OR a.targetId = ${player.id})
  `;
  // Preserve the distinction between a player with zero actions and missing season data.
  // EXISTS stops at the first matching action instead of loading every participant's names.
  const [availability] = await prisma.$queryRaw<{ kills: number; protects: number }[]>`
    SELECT
      EXISTS (
        SELECT 1 FROM games g JOIN game_actions a ON a.gameId = g.id AND a.type = 'kill'
        JOIN players p ON p.id = a.performerId AND p.deletedAt IS NULL
        JOIN players t ON t.id = a.targetId AND t.deletedAt IS NULL
        WHERE g.season = ${seasonId} AND g.deletedAt IS NULL AND a.deletedAt IS NULL
      ) AS kills,
      EXISTS (
        SELECT 1 FROM games g JOIN game_actions a ON a.gameId = g.id AND a.type = 'protect'
        JOIN players p ON p.id = a.performerId AND p.deletedAt IS NULL
        JOIN players t ON t.id = a.targetId AND t.deletedAt IS NULL
        WHERE g.season = ${seasonId} AND g.deletedAt IS NULL AND a.deletedAt IS NULL
      ) AS protects
  `;
  result.kills.available = result.guesses.available = !!availability?.kills;
  result.protects.available = !!availability?.protects;
  const counts = {
    kills: { targets: new Map<string, number>(), killers: new Map<string, number>() },
    guesses: { targets: new Map<string, number>(), killers: new Map<string, number>() },
    protects: { targets: new Map<string, number>(), killers: new Map<string, number>() },
  };
  for (const action of actions) {
    const detail: { isGuess?: boolean } = action.detail ? JSON.parse(action.detail) : {};
    let category: Category;
    if (action.type === 'protect') category = 'protects';
    else if (detail.isGuess === true) {
      if (action.isCorrect !== true && action.isCorrect !== 1) continue;
      category = 'guesses';
    } else {
      if (action.performerRole === 'Prosecutor') continue;
      category = 'kills';
    }
    if (action.performerId === player.id) {
      result[category].kills++;
      const map = counts[category].targets;
      map.set(action.targetName, (map.get(action.targetName) ?? 0) + 1);
    }
    if (action.targetId === player.id) {
      result[category].killed++;
      const map = counts[category].killers;
      map.set(action.performerName, (map.get(action.performerName) ?? 0) + 1);
    }
  }
  const rank = (map: Map<string, number>) => Array.from(map, ([playerName, count]) => ({ playerName, count }))
    .sort((a, b) => b.count - a.count || a.playerName.localeCompare(b.playerName, 'pl'));
  for (const category of ['kills', 'guesses', 'protects'] as const) {
    result[category].targets = rank(counts[category].targets);
    result[category].killers = rank(counts[category].killers);
  }
  return result;
}
