// Integration tests run against real workerd D1, isolated in memory.
import { Miniflare } from 'miniflare';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const mf = new Miniflare({
    modules: true,
    script: 'export default {fetch(){return new Response("ok")}}',
    d1Databases: { DB: 'discord-test' },
    d1Persist: false,
    compatibilityDate: '2025-07-12',
});
try {
    const db = await mf.getD1Database('DB');
    await db.batch([
        db.prepare(
            'CREATE TABLE players(id INTEGER PRIMARY KEY,name TEXT UNIQUE,hashedProductUserId TEXT,deletedAt DATETIME)',
        ),
        db.prepare(
            'CREATE TABLE games(id INTEGER PRIMARY KEY,season INTEGER,startTime DATETIME,deletedAt DATETIME)',
        ),
        db.prepare(
            'CREATE TABLE game_player_statistics(id INTEGER PRIMARY KEY,playerId INTEGER REFERENCES players(id),gameId INTEGER REFERENCES games(id),totalPoints REAL)',
        ),
    ]);
    const sql = await readFile(
        new URL('../prisma/migrations/0012_discord_accounts.sql', import.meta.url),
        'utf8',
    );
    // Split before CREATE rather than semicolons: each trigger body is one statement.
    const statements = sql
        .split(/(?=CREATE (?:TABLE|INDEX|UNIQUE INDEX|TRIGGER) )/)
        .map((s) => s.replace(/^--[^\n]*\n/gm, '').trim())
        .filter(Boolean);
    for (const statement of statements) await db.prepare(statement).run();
    const hostMigration = await readFile(
        new URL('../prisma/migrations/0013_discord_host_permissions.sql', import.meta.url),
        'utf8',
    );
    const hostStatements = hostMigration
        .split(/(?=ALTER TABLE |CREATE (?:TABLE|INDEX|TRIGGER) |DROP TRIGGER |DROP TABLE )/)
        .map((s) => s.replace(/^--[^\n]*\n/gm, '').trim())
        .filter(Boolean);
    for (const statement of hostStatements) await db.prepare(statement).run();
    const run = (sql, ...args) =>
        db
            .prepare(sql)
            .bind(...args)
            .run();
    const first = (sql, ...args) =>
        db
            .prepare(sql)
            .bind(...args)
            .first();
    const count = async (table) => (await first(`SELECT count(*) n FROM ${table}`)).n;
    const command = async (accountId, action, requestId, playerId, expectedVersion) => {
        const id = crypto.randomUUID();
        return db.batch([
            db
                .prepare(
                    'INSERT INTO discord_commands(id,accountId,action,requestId,playerId,expectedVersion,actor,reason) VALUES(?,?,?,?,?,?,?,?)',
                )
                .bind(
                    id,
                    accountId,
                    action,
                    requestId,
                    playerId,
                    expectedVersion,
                    'shared-host',
                    'Sprawdzono profil',
                ),
            db.prepare('DELETE FROM discord_commands WHERE id=?').bind(id),
        ]);
    };
    await run(
        "INSERT INTO players(id,name,hashedProductUserId) VALUES(1,'A B','abcd1234'),(2,'a-b',NULL),(3,'Old season',NULL)",
    );
    await run("INSERT INTO games VALUES(1,1,'2025-01-01',NULL)");
    await run('INSERT INTO game_player_statistics VALUES(1,1,1,10)');
    const before = await first('SELECT * FROM game_player_statistics');
    // Concurrent first logins for the same Discord ID create exactly one account.
    await Promise.all(
        Array.from({ length: 5 }, () =>
            run(
                "INSERT INTO discord_accounts(discordUserId,username) VALUES('100','one') ON CONFLICT(discordUserId) DO UPDATE SET username=excluded.username",
            ),
        ),
    );
    assert.equal(await count('discord_accounts'), 1);
    await run(
        "INSERT INTO discord_accounts(discordUserId,username) VALUES('200','two'),('300','three')",
    );
    const a = (await first("SELECT id FROM discord_accounts WHERE discordUserId='100'")).id;
    const b = (await first("SELECT id FROM discord_accounts WHERE discordUserId='200'")).id;
    const c = (await first("SELECT id FROM discord_accounts WHERE discordUserId='300'")).id;
    const request = (account, player) =>
        run(
            "INSERT INTO discord_link_requests(accountId,playerId) SELECT ?,? WHERE NOT EXISTS(SELECT 1 FROM discord_link_requests WHERE accountId=? AND status='pending' AND playerId=?)",
            account,
            player,
            account,
            player,
        );
    await Promise.all([request(a, 1), request(a, 1)]);
    assert.equal(await count('discord_link_requests'), 1);
    await assert.rejects(request(a, 2)); // Changing target cannot bypass pending-request guard.
    await request(b, 1);
    const ar = (await first('SELECT id FROM discord_link_requests WHERE accountId=?', a)).id;
    const br = (await first('SELECT id FROM discord_link_requests WHERE accountId=?', b)).id;
    const race = await Promise.allSettled([
        command(a, 'approve', ar, null, 0),
        command(b, 'approve', br, null, 0),
    ]);
    assert.equal(race.filter((r) => r.status === 'fulfilled').length, 1);
    assert.equal(await count('discord_link_audits'), 1);
    assert.equal(await count('discord_commands'), 0);
    const owner = await first('SELECT * FROM discord_accounts WHERE playerId=1');
    const loser = owner.id === a ? b : a,
        loserRequest = owner.id === a ? br : ar;
    assert.equal(
        (await first('SELECT status FROM discord_link_requests WHERE id=?', loserRequest)).status,
        'pending',
    );
    // Rename in place keeps the same stable player and all results.
    await run("UPDATE players SET name='Renamed' WHERE hashedProductUserId='abcd1234'");
    assert.equal(
        (await first('SELECT playerId FROM discord_accounts WHERE id=?', owner.id)).playerId,
        1,
    );
    assert.deepEqual(await first('SELECT * FROM game_player_statistics'), before);
    // Stale approve/reject/correct decisions cannot introduce a second audit.
    await assert.rejects(command(owner.id, 'reject', owner.id === a ? ar : br, null, 0));
    assert.equal(await count('discord_link_audits'), 1);
    await command(loser, 'reject', loserRequest, null, 0);
    await assert.rejects(request(loser, 2));
    await command(loser, 'correct', null, null, 1); // Correction does not lift retry restriction.
    await assert.rejects(request(loser, 3));
    await command(loser, 'retry', null, null, 2);
    await request(loser, 3); // Old-season/no-current-season player is eligible.
    const lr = (
        await first(
            "SELECT id FROM discord_link_requests WHERE accountId=? AND status='pending'",
            loser,
        )
    ).id;
    const mixed = await Promise.allSettled([
        command(loser, 'approve', lr, null, 3),
        command(loser, 'reject', lr, null, 3),
    ]);
    assert.equal(mixed.filter((r) => r.status === 'fulfilled').length, 1);
    // Failed second batch statement rolls the already-executed trigger back too.
    const version = (await first('SELECT version FROM discord_accounts WHERE id=?', owner.id))
        .version;
    const auditCount = await count('discord_link_audits');
    await assert.rejects(
        db.batch([
            db
                .prepare(
                    "INSERT INTO discord_commands(id,accountId,action,requestId,playerId,expectedVersion,actor,reason) VALUES('rollback',?,'correct',NULL,2,?,'shared-host','Korekta profilu')",
                )
                .bind(owner.id, version),
            db.prepare(
                "INSERT INTO discord_accounts(discordUserId,username) VALUES('300','duplicate')",
            ),
        ]),
    );
    assert.equal(
        (await first('SELECT playerId FROM discord_accounts WHERE id=?', owner.id)).playerId,
        1,
    );
    assert.equal(await count('discord_link_audits'), auditCount);
    await command(owner.id, 'correct', null, 2, version);
    assert.deepEqual(await first('SELECT * FROM game_player_statistics'), before);
    await run(
        "INSERT INTO discord_sessions(tokenHash,accountId,expiresAt) VALUES('one',?,9999999999999),('two',?,9999999999999)",
        owner.id,
        owner.id,
    );
    await run(
        "INSERT INTO discord_sessions(tokenHash,accountId,expiresAt) VALUES('expired-session',?,0)",
        owner.id,
    );
    assert.equal(
        await first(
            "SELECT a.id FROM discord_sessions s JOIN discord_accounts a ON a.id=s.accountId WHERE s.tokenHash='expired-session' AND s.expiresAt>? AND s.deletedAt IS NULL AND a.deletedAt IS NULL",
            Date.now(),
        ),
        null,
    );
    await run('DELETE FROM discord_accounts WHERE id=?', owner.id);
    assert.equal(
        await first(
            "SELECT a.id FROM discord_sessions s JOIN discord_accounts a ON a.id=s.accountId WHERE s.tokenHash='one' AND s.expiresAt>?",
            Date.now(),
        ),
        null,
    );
    for (const table of [
        'discord_sessions',
        'discord_link_requests',
        'discord_link_audits',
        'discord_commands',
    ])
        assert.equal(
            (await first(`SELECT count(*) n FROM ${table} WHERE accountId=?`, owner.id)).n,
            0,
        );
    assert.equal(await first('SELECT * FROM discord_accounts WHERE id=?', owner.id), null);
    assert.deepEqual(await first('SELECT * FROM game_player_statistics'), before);
    assert.equal(await count('players'), 3);
    // One-time OAuth states are consumed by one of two concurrent callbacks only.
    await run(
        "INSERT INTO discord_oauth_states(stateHash,expiresAt) VALUES('state',9999999999999)",
    );
    const states = await Promise.all([
        first(
            "DELETE FROM discord_oauth_states WHERE stateHash='state' AND expiresAt>? RETURNING id",
            Date.now(),
        ),
        first(
            "DELETE FROM discord_oauth_states WHERE stateHash='state' AND expiresAt>? RETURNING id",
            Date.now(),
        ),
    ]);
    assert.equal(states.filter(Boolean).length, 1);
    await run("INSERT INTO discord_oauth_states(stateHash,expiresAt) VALUES('expired',0)");
    assert.equal(
        await first(
            "DELETE FROM discord_oauth_states WHERE stateHash='expired' AND expiresAt>? RETURNING id",
            Date.now(),
        ),
        null,
    );
    assert.equal((await db.prepare('PRAGMA foreign_key_check').all()).results.length, 0);
    // Host permissions: exact typed nickname, single atomic audit and live revocation.
    const hostCommand = async (accountId, action, confirmationNickname, actorAccountId = null) => {
        const current = await first('SELECT version FROM discord_accounts WHERE id=?', accountId);
        const id = crypto.randomUUID();
        return db.batch([
            db
                .prepare(
                    'INSERT INTO discord_commands(id,accountId,action,expectedVersion,actor,actorAccountId,confirmationNickname,reason) VALUES(?,?,?,?,?,?,?,?)',
                )
                .bind(
                    id,
                    accountId,
                    action,
                    current.version,
                    actorAccountId === null ? 'shared-host' : 'Host Discord',
                    actorAccountId,
                    confirmationNickname,
                    'Zweryfikowano uprawnienia',
                ),
            db.prepare('DELETE FROM discord_commands WHERE id=?').bind(id),
        ]);
    };
    const priorAudits = await count('discord_link_audits');
    await assert.rejects(hostCommand(c, 'grantHost', 'wrong nickname'));
    assert.equal((await first('SELECT isHost FROM discord_accounts WHERE id=?', c)).isHost, 0);
    assert.equal(await count('discord_link_audits'), priorAudits);
    await hostCommand(c, 'grantHost', 'three');
    assert.equal((await first('SELECT isHost FROM discord_accounts WHERE id=?', c)).isHost, 1);
    assert.equal(await count('discord_link_audits'), priorAudits + 1);
    const loserName = (await first('SELECT username FROM discord_accounts WHERE id=?', loser))
        .username;
    await hostCommand(loser, 'grantHost', loserName, c);
    assert.equal((await first('SELECT isHost FROM discord_accounts WHERE id=?', loser)).isHost, 1);
    await hostCommand(c, 'revokeHost', 'three');
    await assert.rejects(hostCommand(loser, 'revokeHost', loserName, c)); // Revoked actor cannot submit a stale privileged request.
    assert.equal((await first('SELECT isHost FROM discord_accounts WHERE id=?', loser)).isHost, 1);
    await run('DELETE FROM discord_accounts WHERE id=?', c);
    assert.equal(
        (await first('SELECT count(*) n FROM discord_link_audits WHERE actorAccountId=?', c)).n,
        0,
    );
    assert.equal(
        (
            await first(
                "SELECT count(*) n FROM discord_link_audits WHERE actor='Host Discord' AND actorAccountId IS NULL",
            )
        ).n,
        1,
    );
    assert.deepEqual(await first('SELECT * FROM game_player_statistics'), before);
    assert.equal((await db.prepare('PRAGMA foreign_key_check').all()).results.length, 0);
    console.log(
        'PASS: isolated D1 — account/login races, request idempotency, unique ownership, version guards, rejection/retry, correction, batch rollback, erasure, unchanged results OAuth state reuse/expiry, host grant nickname guard, immediate revocation and erased actor identity.',
    );
} finally {
    await mf.dispose();
}
