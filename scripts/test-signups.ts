import { Miniflare } from 'miniflare';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { upcomingSession } from '../src/app/dramaafera/_signups/schedule';
import { changeSignup, readUpcomingRoster, saveUpcomingRoster } from '../src/app/dramaafera/_signups/storage';

const mf = new Miniflare({ modules: true, script: 'export default {fetch(){return new Response("ok")}}',
    d1Databases: { DB: 'signups-test' }, d1Persist: false, compatibilityDate: '2025-07-12' });

async function main() {
    try {
        const db = await mf.getD1Database('DB') as unknown as D1Database;
        await db.batch([
            db.prepare('CREATE TABLE players(id INTEGER PRIMARY KEY,name TEXT,deletedAt DATETIME)'),
            db.prepare('CREATE TABLE discord_accounts(id INTEGER PRIMARY KEY,playerId INTEGER,isHost INTEGER,deletedAt DATETIME)'),
            db.prepare('CREATE TABLE discord_sessions(tokenHash TEXT PRIMARY KEY,accountId INTEGER,expiresAt INTEGER,deletedAt DATETIME)'),
            db.prepare("INSERT INTO players VALUES(1,'Alpha',NULL),(2,'Beta',NULL),(3,'Gamma',NULL)"),
            db.prepare('INSERT INTO discord_accounts VALUES(1,1,0,NULL),(2,2,0,NULL),(3,NULL,0,NULL),(4,3,1,NULL)'),
            db.prepare("INSERT INTO discord_sessions VALUES('alpha',1,?,NULL),('beta',2,?,NULL),('unlinked',3,?,NULL),('host',4,?,NULL)")
                .bind(Date.now() + 3600000, Date.now() + 3600000, Date.now() + 3600000, Date.now() + 3600000),
        ]);
        const migration = await readFile('prisma/migrations/0005_add_lista_cweli.sql', 'utf8');
        for (const statement of migration.replace(/--[^\n]*/g, '').split(';').map(s => s.trim()).filter(Boolean)) await db.prepare(statement).run();
        const { date, season } = upcomingSession();
        const names = async () => (await readUpcomingRoster(db)).playerNames;
        assert.deepEqual(await names(), []);
        assert.equal(await changeSignup(db, 'unlinked', date, true), false);
        assert.equal(await changeSignup(db, 'missing', date, true), false);
        assert.equal(await changeSignup(db, 'alpha', '2000-01-05', true), false);
        await Promise.all([changeSignup(db, 'alpha', date, true), changeSignup(db, 'beta', date, true), changeSignup(db, 'alpha', date, true)]);
        assert.deepEqual((await names()).sort(), ['Alpha', 'Beta'], 'concurrent joins retain both people without duplicates');
        const stale = await readUpcomingRoster(db);
        await changeSignup(db, 'host', date, true);
        assert.equal(await saveUpcomingRoster(db, date, ['Alpha'], stale.revision, 'host'), false, 'host cannot overwrite a signup made after loading');
        const fresh = await readUpcomingRoster(db);
        assert.equal(await saveUpcomingRoster(db, date, ['Alpha', 'Beta'], fresh.revision, 'host'), true);
        assert.equal(await saveUpcomingRoster(db, date, [], (await readUpcomingRoster(db)).revision, 'alpha'), false, 'ordinary account is not a host');
        await Promise.all([changeSignup(db, 'alpha', date, false), changeSignup(db, 'host', date, true)]);
        assert.deepEqual((await names()).sort(), ['Beta', 'Gamma'], 'concurrent withdrawal preserves other signups');
        await changeSignup(db, 'alpha', date, false);
        await db.prepare("UPDATE discord_sessions SET expiresAt=0 WHERE tokenHash='alpha'").run();
        assert.equal(await changeSignup(db, 'alpha', date, true), false);
        await db.prepare('UPDATE discord_accounts SET playerId=1 WHERE id=2').run();
        await changeSignup(db, 'beta', date, true);
        assert.ok((await names()).includes('Alpha'), 'write resolves the current Player.id after relinking');
        await db.prepare("UPDATE players SET deletedAt='deleted' WHERE id=1").run();
        assert.equal(await changeSignup(db, 'beta', date, true), false);
        await db.prepare('UPDATE discord_accounts SET isHost=0 WHERE id=4').run();
        assert.equal(await saveUpcomingRoster(db, date, [], (await readUpcomingRoster(db)).revision, 'host'), false, 'role revocation is checked in SQL');
        const rosterBefore = await names();
        await db.prepare("INSERT INTO lista_cweli(season,date,playerNames,updatedAt) VALUES(?,'2000-01-05T00:00:00.000Z','[\"Old\"]',CURRENT_TIMESTAMP)").bind(season).run();
        assert.deepEqual(await names(), rosterBefore, 'previous Wednesdays never populate the upcoming list');
        assert.equal(await saveUpcomingRoster(db, date, [], (await readUpcomingRoster(db)).revision, null), true, 'trusted Basic Auth host may clear the list');
        assert.deepEqual(await names(), []);
        await db.prepare("UPDATE lista_cweli SET deletedAt='deleted',playerNames='[\"Old\"]' WHERE season=? AND date(date)=?").bind(season, date).run();
        await changeSignup(db, 'host', date, true);
        assert.deepEqual(await names(), ['Gamma'], 'reactivating an old soft-deleted row does not restore its old roster');
        assert.equal((await db.prepare('SELECT COUNT(*) count FROM lista_cweli WHERE season=? AND date(date)=?').bind(season, date).first<{ count: number }>())?.count, 1);
        const realNow = Date.now;
        try {
            // Simulate a request that selected last week's schedule before pausing.
            // SQLite's live clock must reject its writes even if JS still sees the old week.
            Date.now = () => realNow() - 7 * 86400000;
            const expiredDate = upcomingSession().date;
            assert.equal(await changeSignup(db, 'host', expiredDate, true), false, 'join cannot write beyond Wednesday 22:00');
            assert.equal(await changeSignup(db, 'host', expiredDate, false), false, 'withdrawal cannot write beyond Wednesday 22:00');
            assert.equal(await saveUpcomingRoster(db, expiredDate, ['Gamma'], '[]', null), false, 'host cannot save an expired week');
        } finally { Date.now = realNow; }
        console.log('Zapisy: atomic joins/withdrawals, live session/link/host checks, stale host drafts, rollover isolation — passed.');
    } finally { await mf.dispose(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
