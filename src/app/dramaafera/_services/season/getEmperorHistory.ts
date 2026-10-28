import { getDatabaseClient } from '../db';
import { chunkedInQuery } from '@/app/api/_database';
import { withoutDeleted } from '@/app/api/schema/common';
import { getSessionEmperors } from './getSessionEmperors';

export interface EmperorEntry {
  nickname: string;
  count: number;
  dates: string[];
  isLatest: boolean;
}

export async function getEmperorHistory(seasonId?: number): Promise<EmperorEntry[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];

  const emperors = await getSessionEmperors(seasonId, { includeOpenSession: true });
  if (emperors.length === 0) return [];

  const playerIds = Array.from(new Set(emperors.map((entry) => entry.playerId)));
  const players = await chunkedInQuery(playerIds, (chunk) =>
    prisma.player.findMany({
      where: { id: { in: chunk }, ...withoutDeleted },
      select: { id: true, name: true },
    }),
  );
  const names = new Map(players.map((player) => [player.id, player.name]));
  const history = new Map<number, EmperorEntry>();
  const latestId = emperors.at(-1)?.playerId;
  for (const { date, playerId } of emperors) {
    const nickname = names.get(playerId);
    if (!nickname) continue;
    const entry = history.get(playerId) ?? {
      nickname, count: 0, dates: [], isLatest: playerId === latestId,
    };
    entry.count++;
    entry.dates.push(date);
    history.set(playerId, entry);
  }
  return Array.from(history.values()).sort((a, b) => b.count - a.count);
}
