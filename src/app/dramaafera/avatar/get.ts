import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { database } from '../_accounts/server';

const querySchema = z.object({
    name: z.string().min(1).max(100),
    fallback: z.enum(['papaj']).optional(),
});

export async function getHandler(request: NextRequest) {
    const query = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!query.success) return new NextResponse(null, { status: 400 });
    try {
        const db = await database();
        // The account is linked by Player.id; a pending request never supplies an avatar.
        const account = await db.prepare(`SELECT a.discordUserId,a.avatar FROM players p
            JOIN discord_accounts a ON a.playerId=p.id
            WHERE p.name=? AND p.deletedAt IS NULL AND a.deletedAt IS NULL LIMIT 1`)
            .bind(query.data.name).first<{ discordUserId: string; avatar: string | null }>();
        let target: string;
        if (account) {
            target = account.avatar
                ? `https://cdn.discordapp.com/avatars/${account.discordUserId}/${account.avatar}.${account.avatar.startsWith('a_') ? 'gif' : 'png'}?size=128`
                : `https://cdn.discordapp.com/embed/avatars/${(BigInt(account.discordUserId) >> BigInt(22)) % BigInt(6)}.png`;
        } else {
            target = new URL(query.data.fallback === 'papaj'
                ? '/images/avatars/papaj.jpg'
                : `/images/avatars/${encodeURIComponent(query.data.name)}.png`, request.url).href;
        }
        return new NextResponse(null, {
            status: 302,
            headers: { Location: target, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
        });
    } catch {
        return new NextResponse(null, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
}
