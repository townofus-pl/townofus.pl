'use server';

import { headers } from 'next/headers';
import { authenticateHeaders } from '@/app/api/_middlewares/auth';
import { getSeasonById } from '../_constants/seasons';
import { generateRoleRankingSummary } from '../_services/rankings/generateRoleRankingStats';
import { getRoleProbabilities } from '../_services/rankings/getRoleProbabilities';

async function authorize(season: number) {
    if (!(await authenticateHeaders(await headers())).success) throw new Error('Brak autoryzacji.');
    if (!getSeasonById(season)) throw new Error('Nieprawidłowy sezon.');
}

export async function getHostRoleRankingsAction(season: number) {
    await authorize(season);
    return generateRoleRankingSummary(season, undefined, undefined, { excludeLatestDay: false });
}

export async function getHostRoleProbabilitiesAction(season: number) {
    await authorize(season);
    return getRoleProbabilities(season);
}
