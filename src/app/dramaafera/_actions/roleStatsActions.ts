'use server';

import { z } from 'zod';
import { getSeasonById } from '@/app/dramaafera/_constants/seasons';
import { isKnownRole } from '@/app/dramaafera/_utils/gameUtils';
import { getRoleStatActions } from '@/app/dramaafera/_services/rankings/getRoleStatActions';

export async function getRoleStatActionsAction(roleName: string, seasonId: number) {
    z.string().min(1).max(100).parse(roleName);
    if (!getSeasonById(seasonId) || !isKnownRole(roleName, seasonId)) throw new Error('Nieprawidłowa rola lub sezon.');
    return getRoleStatActions(roleName, seasonId);
}
