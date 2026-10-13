import { NextRequest } from 'next/server';
import { authenticateHostHeaders } from '@/app/api/_middlewares/hostAuth';
import { database, error, json, safeHandler, session } from '../_accounts/server';
import { parsePollContext } from '../_polls/rules';
import { previewCandidates, readPoll } from '../_polls/server';

export async function getHandler(request: NextRequest) {
    return safeHandler(async () => {
        let context;
        try { context = parsePollContext(request.nextUrl.searchParams.get('date'), request.nextUrl.searchParams.get('season')); }
        catch { return error('Nieprawidłowy dzień lub sezon.'); }
        const db = await database();
        const account = await session(request);
        const { date, season } = context;
        if (request.nextUrl.searchParams.has('candidate')) {
            const candidateId = Number(request.nextUrl.searchParams.get('candidate'));
            const offset = Number(request.nextUrl.searchParams.get('offset') ?? 0);
            if (!Number.isSafeInteger(candidateId) || candidateId < 1 || !Number.isSafeInteger(offset) || offset < 0 || offset > 10000) return error('Nieprawidłowa strona.');
            const voters = await db.prepare(`SELECT voter.id playerId,voter.name nickname FROM emperor_poll_votes v
 JOIN players voter ON voter.id=v.playerId JOIN emperor_poll_candidates c ON c.id=v.candidateId
 JOIN emperor_polls p ON p.id=c.pollId WHERE p.date=? AND p.season=? AND c.id=?
 AND v.deletedAt IS NULL AND voter.deletedAt IS NULL AND c.deletedAt IS NULL AND p.deletedAt IS NULL
 ORDER BY v.id LIMIT 21 OFFSET ?`).bind(date, season, candidateId, offset).all<{ playerId: number; nickname: string }>();
            return json({ voters: voters.results.slice(0, 20), hasMore: voters.results.length > 20 });
        }
        const poll = await readPoll(db, date, season, account?.playerId ?? null);
        if (poll) return json({ poll });
        const host = await authenticateHostHeaders(request.headers);
        if (!host.success) return json({ poll: null, canCreate: false });
        return json({ poll: null, canCreate: true, candidates: await previewCandidates(db, date, season) });
    });
}
