import { getDatabaseClient } from '../db';
import { normalizeRoleName } from '@/app/dramaafera/_utils/gameUtils';
import type { RoleStatAction } from '@/app/dramaafera/_utils/roleActionStats';

/** Only the action fields needed by one role's detailed counters. */
export async function getRoleStatActions(roleName: string, seasonId: number): Promise<RoleStatAction[]> {
    const prisma = await getDatabaseClient();
    if (!prisma) return [];
    const roleKey = normalizeRoleName(roleName, seasonId).toLowerCase().replace(/[^a-z0-9]/g, '');
    return prisma.$queryRaw<RoleStatAction[]>`
        SELECT g.gameIdentifier AS gameId, p.name AS playerName,
               a.performerRole, a.type, a.isCorrect, a.detail
        FROM games g
        JOIN game_actions a ON a.gameId = g.id
        JOIN players p ON p.id = a.performerId
        WHERE g.season = ${seasonId} AND g.deletedAt IS NULL
          AND a.deletedAt IS NULL AND p.deletedAt IS NULL
          AND LOWER(REPLACE(REPLACE(REPLACE(a.performerRole, ' ', ''), '_', ''), '-', '')) = ${roleKey}
          AND a.type IN ('kill', 'protect', 'knight', 'revive', 'swap', 'janitor_clean',
                         'task_completed', 'round_survived', 'vote')
    `;
}
