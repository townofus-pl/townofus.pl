-- Host permissions are checked against D1 on every request, never cached in the cookie.
ALTER TABLE discord_accounts ADD COLUMN isHost BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE discord_link_audits ADD COLUMN actorAccountId INTEGER REFERENCES discord_accounts(id) ON DELETE SET NULL;
CREATE INDEX discord_audits_actor_idx ON discord_link_audits(actorAccountId);
-- Commands are transient: no row is visible between the insert and delete of an atomic batch.
DROP TRIGGER discord_command_apply;
DROP TABLE discord_commands;
CREATE TABLE discord_commands (
 id TEXT PRIMARY KEY, accountId INTEGER NOT NULL REFERENCES discord_accounts(id) ON DELETE CASCADE,
 action TEXT NOT NULL CHECK(action IN ('approve','reject','retry','correct','grantHost','revokeHost')),
 requestId INTEGER, playerId INTEGER, expectedVersion INTEGER NOT NULL,
 actorAccountId INTEGER REFERENCES discord_accounts(id) ON DELETE SET NULL, confirmationNickname TEXT,
 actor TEXT NOT NULL, reason TEXT NOT NULL CHECK(length(trim(reason)) BETWEEN 3 AND 1000),
 createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, deletedAt DATETIME
);
CREATE TRIGGER discord_command_apply AFTER INSERT ON discord_commands BEGIN
 SELECT CASE WHEN NEW.actorAccountId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM discord_accounts WHERE id=NEW.actorAccountId AND isHost=1 AND deletedAt IS NULL)
 THEN RAISE(ABORT,'host_authorization_conflict') END;
 SELECT CASE WHEN NEW.action IN ('grantHost','revokeHost') AND NOT EXISTS(SELECT 1 FROM discord_accounts WHERE id=NEW.accountId AND username=NEW.confirmationNickname)
 THEN RAISE(ABORT,'nickname_confirmation_conflict') END;
 SELECT CASE WHEN NEW.action='grantHost' AND (SELECT isHost FROM discord_accounts WHERE id=NEW.accountId)=1
 OR NEW.action='revokeHost' AND (SELECT isHost FROM discord_accounts WHERE id=NEW.accountId)=0
 THEN RAISE(ABORT,'host_role_conflict') END;
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
 INSERT INTO discord_link_audits(accountId,actor,actorAccountId,action,reason,previousPlayerId,newPlayerId)
 SELECT id,NEW.actor,NEW.actorAccountId,NEW.action,NEW.reason,playerId,
 CASE WHEN NEW.action='approve' THEN (SELECT playerId FROM discord_link_requests WHERE id=NEW.requestId)
 WHEN NEW.action='correct' THEN NEW.playerId ELSE playerId END FROM discord_accounts WHERE id=NEW.accountId;
 UPDATE discord_accounts SET
 playerId=CASE WHEN NEW.action='approve' THEN (SELECT playerId FROM discord_link_requests WHERE id=NEW.requestId)
 WHEN NEW.action='correct' THEN NEW.playerId ELSE playerId END,
 retryBlocked=CASE WHEN NEW.action='reject' THEN 1 WHEN NEW.action='retry' THEN 0 ELSE retryBlocked END,
 isHost=CASE WHEN NEW.action='grantHost' THEN 1 WHEN NEW.action='revokeHost' THEN 0 ELSE isHost END,
 version=version+1,updatedAt=CURRENT_TIMESTAMP WHERE id=NEW.accountId;
 UPDATE discord_link_requests SET status=CASE NEW.action WHEN 'approve' THEN 'approved' ELSE 'rejected' END,
 updatedAt=CURRENT_TIMESTAMP WHERE id=NEW.requestId AND NEW.action IN ('approve','reject');
 UPDATE discord_link_requests SET status='superseded',updatedAt=CURRENT_TIMESTAMP
 WHERE accountId=NEW.accountId AND status='pending' AND NEW.action='correct';
END;
