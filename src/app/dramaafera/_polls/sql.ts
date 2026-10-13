// The game's own season and the canonical gameIdentifier define the session.
export const candidateTotals = `SELECT p.id playerId,p.name nickname,SUM(s.totalPoints) totalPoints
 FROM games g JOIN game_player_statistics s ON s.gameId=g.id JOIN players p ON p.id=s.playerId
 WHERE g.gameIdentifier>=? AND g.gameIdentifier<? AND g.season=?
 AND g.deletedAt IS NULL AND p.deletedAt IS NULL GROUP BY p.id`;

export const saveVoteSql = `INSERT INTO emperor_poll_votes(pollId,playerId,candidateId,updatedAt)
 SELECT p.id,a.playerId,c.id,CURRENT_TIMESTAMP FROM emperor_polls p
 JOIN emperor_poll_candidates c ON c.pollId=p.id
 JOIN discord_sessions s ON s.tokenHash=? JOIN discord_accounts a ON a.id=s.accountId
 JOIN players voter ON voter.id=a.playerId JOIN players target ON target.id=c.playerId
 WHERE p.date=? AND p.season=? AND c.id=? AND c.playerId<>a.playerId
 AND p.closesAt>CAST(unixepoch('subsec')*1000 AS INTEGER)
 AND s.expiresAt>CAST(unixepoch('subsec')*1000 AS INTEGER)
 AND p.deletedAt IS NULL AND c.deletedAt IS NULL AND s.deletedAt IS NULL
 AND a.deletedAt IS NULL AND voter.deletedAt IS NULL AND target.deletedAt IS NULL
 ON CONFLICT(pollId,playerId) DO UPDATE SET candidateId=excluded.candidateId,
 updatedAt=CURRENT_TIMESTAMP,deletedAt=NULL`;
