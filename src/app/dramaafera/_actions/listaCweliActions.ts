'use server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { database } from '../_accounts/server';
import { hashToken, SESSION_COOKIE, validToken } from '../_accounts/security';
import { upcomingSession } from '../_signups/schedule';
import { readUpcomingRoster, saveUpcomingRoster } from '../_signups/storage';
import { requireHost, requireHostMutation } from '@/app/dramaafera/_accounts/requireHost';

import { getDatabaseClient } from '@/app/dramaafera/_services/db';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { createPlayerWithRanking } from '@/app/api/_utils';
import { findSimilarPlayerName } from '@/app/dramaafera/_utils/textMatch';
import { getListaCweliPlayerPickerData } from '@/app/dramaafera/_services/gameSessionList/getListaCweliPlayerPicker';
import type {
  GameSessionListSummary,
  PlayerPickerData,
} from '@/app/dramaafera/_services/gameSessionList/types';

/**
 * Data for the Lista Cweli player picker (main list + Add-player dialog).
 */
export async function getPlayerPickerData(seasonId: number): Promise<PlayerPickerData> {
  await requireHost();
  return getListaCweliPlayerPickerData(seasonId);
}

/**
 * Flags brand-new player names that look like typos of an existing player
 * (exact match after folding case/diacritics, or Levenshtein distance <= 1).
 */
export async function checkNewPlayerNames(
  candidateNames: string[]
): Promise<Array<{ candidate: string; similarTo: string | null }>> {
  await requireHost();
  const prisma = await getDatabaseClient();
  if (!prisma) return candidateNames.map((candidate) => ({ candidate, similarTo: null }));

  const existingNames = (
    await prisma.player.findMany({ where: { ...withoutDeleted }, select: { name: true } })
  ).map((p) => p.name);

  return candidateNames.map((candidate) => ({
    candidate,
    similarTo: findSimilarPlayerName(candidate, existingNames),
  }));
}

/**
 * Get all saved game session lists for the current season
 */
export async function getGameSessionLists(seasonId?: number): Promise<GameSessionListSummary[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];

  const season = seasonId ?? CURRENT_SEASON;

  try {
    const lists = await prisma.listaCweli.findMany({
      where: {
        season,
        ...(season === CURRENT_SEASON ? { date: new Date(`${upcomingSession().date}T00:00:00.000Z`) } : {}),
        ...withoutDeleted,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return lists.map((list) => {
      const players = JSON.parse(list.playerNames) as string[];
      const dateObj = new Date(list.date);
      
      return {
        id: list.id,
        date: dateObj.toISOString().split('T')[0],
        dateFormatted: dateObj.toLocaleDateString('pl-PL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        playerCount: players.length,
        players: players.map((name) => ({
            name,
          })),
      };
    });
  } catch (error) {
    console.error('Error fetching game session lists:', error);
    return [];
  }
}

/** The host only edits the automatically selected upcoming Wednesday. */
export async function getUpcomingGameSessionList() {
  await requireHost();
  return readUpcomingRoster(await database());
}

const rosterSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  names: z.array(z.string().trim().min(1).max(100)).max(200),
  newNames: z.array(z.string().trim().min(1).max(100)).max(200),
  revision: z.string().max(25000),
}).strict();

export async function saveUpcomingGameSessionList(input: z.infer<typeof rosterSchema>) {
  const host = await requireHostMutation();
  const parsed = rosterSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: 'Nieprawidłowe dane listy.' };
  const { date, names, newNames, revision } = parsed.data;
  const schedule = upcomingSession();
  if (date !== schedule.date) return { success: false as const, error: 'Rozpoczęły się zapisy na kolejną środę. Odśwież listę.' };
  try {
    const prisma = await getDatabaseClient();
    if (!prisma) return { success: false as const, error: 'Nie udało się połączyć z bazą.' };
    for (const name of new Set(newNames.filter(name => names.includes(name)))) {
      const existing = await prisma.player.findFirst({ where: { name, ...withoutDeleted } });
      if (!existing) await createPlayerWithRanking(prisma, name);
    }
    const requestHeaders = await headers();
    const token = requestHeaders.get('cookie')?.split(';').map(part => part.trim())
      .find(part => part.startsWith(SESSION_COOKIE + '='))?.slice(SESSION_COOKIE.length + 1);
    if (host.accountId != null && !validToken(token)) return { success: false as const, error: 'Zaloguj się ponownie.' };
    const tokenHash = host.accountId != null && validToken(token) ? await hashToken(token) : null;
    const db = await database();
    const saved = await saveUpcomingRoster(db, date, [...new Set(names)], revision, tokenHash);
    if (!saved) return { success: false as const, error: 'Lista zmieniła się w międzyczasie lub uprawnienia wygasły. Odśwież ją i spróbuj ponownie.' };
    return { success: true as const, roster: await readUpcomingRoster(db) };
  } catch {
    return { success: false as const, error: 'Nie udało się zapisać listy. Spróbuj ponownie.' };
  }
}
