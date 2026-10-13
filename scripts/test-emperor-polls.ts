import { Miniflare } from 'miniflare';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createPoll, previewCandidates, readPoll } from '../src/app/dramaafera/_polls/storage';
import { saveVoteSql } from '../src/app/dramaafera/_polls/sql';

const mf = new Miniflare({ modules: true, script: 'export default {fetch(){return new Response("ok")}}', d1Databases: { DB: 'poll-test' }, d1Persist: false, compatibilityDate: '2025-07-12' });
async function main() {
    try {
        const db = await mf.getD1Database('DB') as unknown as D1Database;
        await db.batch([
            db.prepare('CREATE TABLE players(id INTEGER PRIMARY KEY,name TEXT,deletedAt DATETIME)'),
            db.prepare('CREATE TABLE games(id INTEGER PRIMARY KEY,gameIdentifier TEXT,season INTEGER,deletedAt DATETIME)'),
            db.prepare('CREATE TABLE game_player_statistics(id INTEGER PRIMARY KEY,gameId INTEGER,playerId INTEGER,totalPoints REAL)'),
            db.prepare('CREATE TABLE discord_accounts(id INTEGER PRIMARY KEY,playerId INTEGER,isHost INTEGER,deletedAt DATETIME)'),
            db.prepare('CREATE TABLE discord_sessions(tokenHash TEXT,accountId INTEGER,expiresAt INTEGER,deletedAt DATETIME)'),
        ]);
        const sql = await readFile('prisma/migrations/0014_emperor_polls.sql', 'utf8');
        for (const statement of sql.split(/(?=CREATE (?:TABLE|UNIQUE INDEX|INDEX|TRIGGER) )/).map(s => s.replace(/^--[^\n]*\n/gm, '').trim()).filter(Boolean)) await db.prepare(statement).run();
        for (let i = 1; i <= 14; i++) await db.prepare('INSERT INTO players VALUES(?,?,NULL)').bind(i, `Gracz ${i}`).run();
        await db.batch([
            db.prepare("INSERT INTO games VALUES(1,'20261012_2000',4,NULL),(2,'20261012_2100',4,NULL),(3,'20261012_2200',3,NULL),(4,'20261012_2300',4,'deleted')"),
            db.prepare('INSERT INTO discord_accounts VALUES(1,14,1,NULL),(2,1,0,NULL),(3,NULL,0,NULL)'),
            db.prepare("INSERT INTO discord_sessions VALUES('host',1,?,NULL),('voter',2,?,NULL),('unlinked',3,?,NULL)").bind(Date.now() + 3600000, Date.now() + 3600000, Date.now() + 3600000),
        ]);
        for (let i = 1; i <= 13; i++) await db.prepare('INSERT INTO game_player_statistics(gameId,playerId,totalPoints) VALUES(1,?,?)').bind(i, i < 10 ? 100 - i : i <= 12 ? 20 : 19).run();
        await db.prepare('INSERT INTO game_player_statistics(gameId,playerId,totalPoints) VALUES(3,14,10000),(4,14,10000)').run();
        const preview = await previewCandidates(db, '20261012', 4);
        assert.equal(preview.length, 12, 'include every tie at position 10');
        assert.ok(!preview.some(p => p.playerId === 14), 'exclude other seasons and deleted games');
        const race = await Promise.allSettled([createPoll(db, '20261012', 4, 'host'), createPoll(db, '20261012', 4, 'host')]);
        assert.equal(race.filter(r => r.status === 'fulfilled').length, 1);
        const poll = (await readPoll(db, '20261012', 4, 1))!;
        assert.equal(poll.candidates.length, 12);
        await db.prepare('UPDATE game_player_statistics SET totalPoints=50000 WHERE playerId=13').run();
        assert.equal((await readPoll(db, '20261012', 4))!.candidates.length, 12, 'candidate snapshot stays fixed');
        const self = poll.candidates.find(c => c.playerId === 1)!;
        const target = poll.candidates.find(c => c.playerId === 2)!;
        const other = poll.candidates.find(c => c.playerId === 3)!;
        const statsBeforeVoting = await db.prepare('SELECT * FROM game_player_statistics ORDER BY id').all();
        const vote = (token: string, candidateId: number) => db.prepare(saveVoteSql).bind(token, '20261012', 4, candidateId).run();
        assert.equal((await vote('voter', self.id)).meta.changes, 0);
        assert.equal((await vote('unlinked', target.id)).meta.changes, 0);
        assert.equal((await vote('voter', 999999)).meta.changes, 0);
        await vote('voter', target.id);
        await vote('voter', other.id);
        assert.equal((await readPoll(db, '20261012', 4, 1))!.selectedCandidateId, other.id);
        assert.equal((await readPoll(db, '20261012', 4))!.totalVotes, 1);
        await Promise.all([vote('voter', target.id), vote('voter', other.id)]);
        assert.equal((await readPoll(db, '20261012', 4))!.totalVotes, 1, 'concurrent votes cannot duplicate');
        await vote('host', target.id);
        assert.equal((await readPoll(db, '20261012', 4))!.totalVotes, 2, 'nonparticipant host can vote');
        await db.prepare('UPDATE discord_accounts SET playerId=13 WHERE id=2').run();
        await vote('voter', target.id);
        assert.equal((await readPoll(db, '20261012', 4))!.totalVotes, 3, 'correction retains old player vote and uses current player identity');
        await db.prepare('UPDATE discord_accounts SET playerId=1 WHERE id=2').run();
        await db.prepare("UPDATE players SET deletedAt='deleted' WHERE id=1").run();
        assert.equal((await vote('voter', target.id)).meta.changes, 0, 'soft deleted voter cannot vote');
        await db.prepare('UPDATE players SET deletedAt=NULL WHERE id=1').run();
        await db.prepare("UPDATE discord_sessions SET expiresAt=0 WHERE tokenHash='voter'").run();
        assert.equal((await vote('voter', target.id)).meta.changes, 0);
        await db.prepare('DELETE FROM discord_sessions WHERE accountId=1').run();
        await db.prepare('DELETE FROM discord_accounts WHERE id=1').run();
        assert.equal((await readPoll(db, '20261012', 4))!.totalVotes, 3, 'account closure retains player votes');
        await db.prepare('UPDATE emperor_polls SET closesAt=0').run();
        await db.prepare("UPDATE discord_sessions SET expiresAt=? WHERE tokenHash='voter'").bind(Date.now() + 3600000).run();
        assert.equal((await vote('voter', target.id)).meta.changes, 0);
        await assert.rejects(db.prepare('UPDATE emperor_poll_votes SET candidateId=? WHERE playerId=1').bind(target.id).run(), /poll_vote_invalid/);
        await assert.rejects(createPoll(db, '20261011', 4, null));
        await db.prepare("INSERT INTO games VALUES(5,'20261011_2000',4,NULL)").run();
        await db.prepare('INSERT INTO game_player_statistics(gameId,playerId,totalPoints) VALUES(5,1,10)').run();
        await assert.rejects(createPoll(db, '20261011', 4, 'host'), 'erased host cannot create');
        await createPoll(db, '20261011', 4, null);
        const secondPoll = (await readPoll(db, '20261011', 4))!;
        assert.equal(secondPoll.candidates.length, 1, 'fewer than 10 players');
        await assert.rejects(db.prepare('INSERT INTO emperor_poll_votes(pollId,playerId,candidateId,updatedAt) VALUES(?,14,?,CURRENT_TIMESTAMP)').bind(secondPoll.id, target.id).run(), /poll_vote_invalid/, 'candidate must belong to this poll');
        const statsAfterVoting = await db.prepare('SELECT * FROM game_player_statistics WHERE gameId<>5 ORDER BY id').all();
        assert.deepEqual(statsAfterVoting.results, statsBeforeVoting.results, 'poll voting does not alter game points');
        const deadlineCases = [
            ['20261014', '2026-10-13T12:00:00Z', '2026-10-14T16:00:00Z', '2026-10-14T15:00:00Z'],
            ['20261021', '2026-10-21T15:30:00Z', '2026-10-21T16:00:00Z', '2026-10-28T16:00:00Z'],
            ['20260325', '2026-03-25T16:30:00Z', '2026-03-25T17:00:00Z', '2026-04-01T15:00:00Z'],
            ['20261028', '2026-10-14T14:30:00Z', '2026-10-14T15:00:00Z', '2026-10-14T15:00:00Z'],
        ];
        for (const [date, createdAt, previous] of deadlineCases) await db.prepare('INSERT INTO emperor_polls(date,season,createdAt,updatedAt,closesAt) VALUES(?,4,?,CURRENT_TIMESTAMP,?)').bind(date, createdAt, Date.parse(previous)).run();
        const deadlineMigration = await readFile('prisma/migrations/0015_emperor_poll_deadline_17.sql', 'utf8');
        for (let repeat = 0; repeat < 2; repeat++) {
            await db.prepare(deadlineMigration).run();
            for (const [date, , , expected] of deadlineCases) {
                const row = await db.prepare('SELECT closesAt FROM emperor_polls WHERE date=?').bind(date).first<{ closesAt: number }>();
                assert.equal(row!.closesAt, Date.parse(expected), 'migrate to 17:00 with DST, next Wednesday and idempotence');
            }
        }
        console.log('Ankiety: D1 — konkurencja, snapshot, sezon, powiązanie, głosy i deadline OK.');
    } finally { await mf.dispose(); }
}
void main().catch(cause => { console.error(cause); process.exitCode = 1; });
