import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authenticateHostHeaders } from '@/app/api/_middlewares/hostAuth';
import { database, error, json, mutationAllowed, safeHandler } from '../../_accounts/server';
const schema = z
    .object({
        accountId: z.number().int().positive(),
        expectedVersion: z.number().int().nonnegative(),
        action: z.enum(['approve', 'reject', 'retry', 'correct', 'grantHost', 'revokeHost']),
        requestId: z.number().int().positive().optional(),
        playerId: z.number().int().positive().nullable().optional(),
        confirmationNickname: z.string().max(100).optional(),
        reason: z.string().trim().min(3).max(1000),
    })
    .strict()
    .refine((d) => !['approve', 'reject'].includes(d.action) || d.requestId !== undefined)
    .refine((d) => d.action !== 'correct' || d.playerId !== undefined)
    .refine((d) => !['grantHost', 'revokeHost'].includes(d.action) || !!d.confirmationNickname);
export async function POST(request: NextRequest) {
    return safeHandler(async () => {
        const auth = await authenticateHostHeaders(request.headers);
        if (!auth.success || !auth.user) return error('Wymagane uprawnienia hosta.', 403);
        if (!mutationAllowed(request)) return error('Niedozwolone źródło żądania.', 403);
        const parsed = schema.safeParse(await request.json());
        if (!parsed.success) return error('Podaj poprawne dane oraz uzasadnienie.');
        const d = parsed.data,
            db = await database(),
            id = crypto.randomUUID();
        await db.batch([
            db
                .prepare(
                    `INSERT INTO discord_commands(id,accountId,action,requestId,playerId,expectedVersion,actor,actorAccountId,confirmationNickname,reason) VALUES (?,?,?,?,?,?,?,?,?,?)`,
                )
                .bind(
                    id,
                    d.accountId,
                    d.action,
                    d.requestId ?? null,
                    d.playerId ?? null,
                    d.expectedVersion,
                    auth.user.username,
                    auth.user.accountId ?? null,
                    d.confirmationNickname ?? null,
                    d.reason,
                ),
            db.prepare('DELETE FROM discord_commands WHERE id=?').bind(id),
        ]);
        return json({ success: true });
    });
}
