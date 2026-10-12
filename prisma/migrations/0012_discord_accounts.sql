-- Additive migration: no game, player or ranking rows are rewritten.
CREATE TABLE discord_accounts (
 id INTEGER PRIMARY KEY AUTOINCREMENT, discordUserId TEXT NOT NULL UNIQUE,
 username TEXT NOT NULL, avatar TEXT, playerId INTEGER UNIQUE REFERENCES players(id) ON DELETE RESTRICT,
 retryBlocked BOOLEAN NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 0,
 createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, deletedAt DATETIME
);
CREATE TABLE discord_sessions (
 id INTEGER PRIMARY KEY AUTOINCREMENT, tokenHash TEXT NOT NULL UNIQUE,
 accountId INTEGER NOT NULL REFERENCES discord_accounts(id) ON DELETE CASCADE,
 expiresAt BIGINT NOT NULL, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, deletedAt DATETIME
);
CREATE INDEX discord_sessions_accountId_idx ON discord_sessions(accountId);
CREATE INDEX discord_sessions_expiresAt_idx ON discord_sessions(expiresAt);
CREATE TABLE discord_oauth_states (
 id INTEGER PRIMARY KEY AUTOINCREMENT, stateHash TEXT NOT NULL UNIQUE, expiresAt BIGINT NOT NULL,
 createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, deletedAt DATETIME
);
CREATE TABLE discord_link_requests (
 id INTEGER PRIMARY KEY AUTOINCREMENT, accountId INTEGER NOT NULL REFERENCES discord_accounts(id) ON DELETE CASCADE,
 playerId INTEGER NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','superseded')),
 createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, deletedAt DATETIME
);
CREATE UNIQUE INDEX discord_requests_one_pending ON discord_link_requests(accountId) WHERE status='pending';
CREATE INDEX discord_link_requests_accountId_status_idx ON discord_link_requests(accountId,status);
CREATE INDEX discord_link_requests_status_id_idx ON discord_link_requests(status,id);
CREATE TABLE discord_link_audits (
 id INTEGER PRIMARY KEY AUTOINCREMENT, accountId INTEGER NOT NULL REFERENCES discord_accounts(id) ON DELETE CASCADE,
 actor TEXT NOT NULL, action TEXT NOT NULL, reason TEXT NOT NULL, previousPlayerId INTEGER, newPlayerId INTEGER,
 createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, deletedAt DATETIME
);
CREATE INDEX discord_link_audits_accountId_id_idx ON discord_link_audits(accountId,id);
-- Each command is consumed in one D1 batch (insert + delete). Triggers enforce guards
-- and write the link, status and audit inside the same SQLite statement/transaction.
CREATE TABLE discord_commands (
 id TEXT PRIMARY KEY, accountId INTEGER NOT NULL REFERENCES discord_accounts(id) ON DELETE CASCADE,
 action TEXT NOT NULL CHECK(action IN ('approve','reject','retry','correct')),
 requestId INTEGER, playerId INTEGER, expectedVersion INTEGER NOT NULL,
 actor TEXT NOT NULL, reason TEXT NOT NULL CHECK(length(trim(reason)) BETWEEN 3 AND 1000),
 createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, deletedAt DATETIME
);
CREATE TRIGGER discord_request_guard BEFORE INSERT ON discord_link_requests BEGIN
 SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM discord_accounts a JOIN players p ON p.id=NEW.playerId
 WHERE a.id=NEW.accountId AND a.deletedAt IS NULL AND p.deletedAt IS NULL
 AND a.retryBlocked=0 AND a.playerId IS NULL
 AND NOT EXISTS(SELECT 1 FROM discord_accounts owner WHERE owner.playerId=NEW.playerId))
 THEN RAISE(ABORT,'request_conflict') END;
END;
CREATE TRIGGER discord_command_apply AFTER INSERT ON discord_commands BEGIN
 SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM discord_accounts WHERE id=NEW.accountId AND deletedAt IS NULL AND version=NEW.expectedVersion)
 THEN RAISE(ABORT,'version_conflict') END;
 SELECT CASE WHEN NEW.action IN ('approve','reject') AND NOT EXISTS
 (SELECT 1 FROM discord_link_requests WHERE id=NEW.requestId AND accountId=NEW.accountId AND status='pending' AND deletedAt IS NULL)
 THEN RAISE(ABORT,'request_conflict') END;
 SELECT CASE WHEN NEW.action='approve' AND (SELECT playerId FROM discord_accounts WHERE id=NEW.accountId) IS NOT NULL
 THEN RAISE(ABORT,'link_conflict') END;
 SELECT CASE WHEN NEW.action='retry' AND (SELECT retryBlocked FROM discord_accounts WHERE id=NEW.accountId)<>1
 THEN RAISE(ABORT,'retry_conflict') END;
 SELECT CASE WHEN NEW.action='correct' AND NEW.playerId IS NOT NULL AND NOT EXISTS
 (SELECT 1 FROM players WHERE id=NEW.playerId AND deletedAt IS NULL)
 THEN RAISE(ABORT,'player_conflict') END;
 SELECT CASE WHEN NEW.action='approve' AND NOT EXISTS
 (SELECT 1 FROM players WHERE id=(SELECT playerId FROM discord_link_requests WHERE id=NEW.requestId) AND deletedAt IS NULL)
 THEN RAISE(ABORT,'player_conflict') END;
 INSERT INTO discord_link_audits(accountId,actor,action,reason,previousPlayerId,newPlayerId)
 SELECT id,NEW.actor,NEW.action,NEW.reason,playerId,
 CASE WHEN NEW.action='approve' THEN (SELECT playerId FROM discord_link_requests WHERE id=NEW.requestId)
 WHEN NEW.action='correct' THEN NEW.playerId ELSE playerId END FROM discord_accounts WHERE id=NEW.accountId;
 UPDATE discord_accounts SET
 playerId=CASE WHEN NEW.action='approve' THEN (SELECT playerId FROM discord_link_requests WHERE id=NEW.requestId)
 WHEN NEW.action='correct' THEN NEW.playerId ELSE playerId END,
 retryBlocked=CASE WHEN NEW.action='reject' THEN 1 WHEN NEW.action='retry' THEN 0 ELSE retryBlocked END,
 version=version+1,updatedAt=CURRENT_TIMESTAMP WHERE id=NEW.accountId;
 UPDATE discord_link_requests SET status=CASE NEW.action WHEN 'approve' THEN 'approved' ELSE 'rejected' END,
 updatedAt=CURRENT_TIMESTAMP WHERE id=NEW.requestId AND NEW.action IN ('approve','reject');
 UPDATE discord_link_requests SET status='superseded',updatedAt=CURRENT_TIMESTAMP
 WHERE accountId=NEW.accountId AND status='pending' AND NEW.action='correct';
END;
