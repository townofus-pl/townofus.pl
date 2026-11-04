'use server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { authenticateHeaders } from '@/app/api/_middlewares/auth';
import { getSeasonById } from '@/app/dramaafera/_constants/seasons';
import { ROLE_REVIEW_DECISIONS } from '@/app/dramaafera/_utils/roleReview';
import { getRoleBalanceOverview, initializeRoleBalanceCycles, saveRoleBalanceReview, type SaveRoleBalanceReview } from '@/app/dramaafera/_services/rankings/roleBalanceReviews';

type WriteResult = { success: true } | { success: false; error: string };
function failure(error: unknown): WriteResult {
    if (error instanceof z.ZodError) return { success: false, error: 'Nieprawidłowe dane formularza.' };
    const known = /^(Brak autoryzacji|Nieprawidłowy sezon|Wybierz|Rola ma|Najpierw|Dane przeglądu|Granica|Przegląd wymaga|Opisz|Inny host|Sesja ma|Wybrana gra|Pojawiła się)/;
    return { success: false, error: error instanceof Error && known.test(error.message) ? error.message : 'Nie udało się zapisać przeglądu. Odśwież dane i spróbuj ponownie.' };
}
async function authorize(season: number): Promise<string> {
    const auth = await authenticateHeaders(await headers());
    if (!auth.success || !auth.user) throw new Error('Brak autoryzacji.');
    if (!getSeasonById(season)) throw new Error('Nieprawidłowy sezon.');
    return auth.user.username;
}
export async function getRoleBalanceOverviewAction(season: number) {
    await authorize(season);
    return getRoleBalanceOverview(season);
}
export async function initializeRoleBalanceAction(season: number, firstGameId: number, roleName?: string): Promise<WriteResult> {
    try {
        const author = await authorize(season);
        z.number().int().positive().parse(firstGameId);
        if (roleName !== undefined) z.string().min(1).max(100).parse(roleName);
        await initializeRoleBalanceCycles(season, firstGameId, author, roleName);
        return { success: true };
    } catch (error) { return failure(error); }
}
export async function saveRoleBalanceReviewAction(input: SaveRoleBalanceReview & { confirmed: boolean }): Promise<WriteResult> {
    try {
        const author = await authorize(input.season);
        const parsed = z.object({
            season: z.number().int().positive(), roleName: z.string().min(1).max(100),
            revision: z.number().int().nonnegative(), throughGameId: z.number().int().positive(),
            decision: z.enum(ROLE_REVIEW_DECISIONS), note: z.string().max(2000),
            sampleToken: z.string().regex(/^[a-f0-9]{64}$/), confirmed: z.literal(true),
        }).strict().parse(input);
        await saveRoleBalanceReview(parsed, author);
        return { success: true };
    } catch (error) { return failure(error); }
}
