import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import { getSessionEmperors } from '../season/getSessionEmperors';

/** Number of unique wins on closed session dates, including a past season's finale. */
export async function getPlayerStars(nick: string, seasonId?: number): Promise<number> {
  const prisma = await getDatabaseClient();
  if (!prisma) return 0;
  const player = await prisma.player.findFirst({
    where: { name: nick, ...withoutDeleted },
    select: { id: true },
  });
  if (!player) return 0;
  const emperors = await getSessionEmperors(seasonId);
  return emperors.filter((entry) => entry.playerId === player.id).length;
}
