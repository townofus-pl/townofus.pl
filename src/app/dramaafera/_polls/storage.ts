import { pollDeadline, selectCandidates, type PollCandidate } from './rules';
import { candidateTotals } from './sql';
import type { PollView } from './types';

export async function previewCandidates(db: D1Database, date: string, season: number) {
    const result = await db.prepare(candidateTotals).bind(`${date}_`, `${date}\uffff`, season).all<PollCandidate>();
    return selectCandidates(result.results);
}

export async function readPoll(db: D1Database, date: string, season: number, playerId: number | null = null): Promise<PollView | null> {
    const poll = await db.prepare('SELECT id,date,season,closesAt FROM emperor_polls WHERE date=? AND season=? AND deletedAt IS NULL').bind(date, season).first<{ id: number; date: string; season: number; closesAt: number }>();
    if (!poll) return null;
    const candidates = await db.prepare(`SELECT c.id,c.playerId,p.name nickname,c.totalPoints,
 (SELECT COUNT(*) FROM emperor_poll_votes v JOIN players voter ON voter.id=v.playerId
 WHERE v.candidateId=c.id AND v.deletedAt IS NULL AND voter.deletedAt IS NULL) votes
 FROM emperor_poll_candidates c JOIN players p ON p.id=c.playerId
 WHERE c.pollId=? AND c.deletedAt IS NULL AND p.deletedAt IS NULL ORDER BY c.totalPoints DESC,c.playerId`).bind(poll.id).all<PollView['candidates'][number]>();
    const selected = playerId === null ? null : await db.prepare('SELECT candidateId FROM emperor_poll_votes WHERE pollId=? AND playerId=? AND deletedAt IS NULL').bind(poll.id, playerId).first<{ candidateId: number }>();
    return { ...poll, closed: Date.now() >= poll.closesAt, candidates: candidates.results,
        totalVotes: candidates.results.reduce((sum, c) => sum + c.votes, 0), playerId,
        selectedCandidateId: selected?.candidateId ?? null };
}

export async function createPoll(db: D1Database, date: string, season: number, tokenHash: string | null) {
    const createdAt = Date.now();
    const closesAt = pollDeadline(createdAt);
    const results = await db.batch([
        db.prepare(`INSERT INTO emperor_polls(date,season,closesAt,createdAt,updatedAt)
 SELECT ?,?,?,?,CURRENT_TIMESTAMP WHERE EXISTS (${candidateTotals})
 AND (? IS NULL OR EXISTS (SELECT 1 FROM discord_sessions s JOIN discord_accounts a ON a.id=s.accountId
 WHERE s.tokenHash=? AND s.expiresAt>CAST(unixepoch('subsec')*1000 AS INTEGER)
 AND s.deletedAt IS NULL AND a.deletedAt IS NULL AND a.isHost=1))`).bind(date, season, closesAt, new Date(createdAt).toISOString(), `${date}_`, `${date}\uffff`, season, tokenHash, tokenHash),
        db.prepare(`INSERT INTO emperor_poll_candidates(pollId,playerId,totalPoints,updatedAt)
 SELECT (SELECT id FROM emperor_polls WHERE date=? AND season=? AND deletedAt IS NULL),playerId,totalPoints,CURRENT_TIMESTAMP
 FROM (SELECT totals.*,RANK() OVER (ORDER BY totalPoints DESC) position FROM (${candidateTotals}) totals)
 WHERE position<=10 AND EXISTS(SELECT 1 FROM emperor_polls WHERE date=? AND season=? AND deletedAt IS NULL)`).bind(date, season, `${date}_`, `${date}\uffff`, season, date, season),
    ]);
    if (results[0].meta.changes !== 1) throw new Error('Brak kandydatów lub uprawnień hosta.');
}
