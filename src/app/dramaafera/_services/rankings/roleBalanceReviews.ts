import { getRoleAssessment } from '@/app/dramaafera/_utils/roleStrength';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDatabaseClient } from '../db';
import { generateRoleRankingStats } from './generateRoleRankingStats';
import { convertRoleNameForDisplay, getRoleColor } from '@/app/dramaafera/_utils/gameUtils';
import { compareReviewBoundary, toReviewTime, ROLE_REVIEW_THRESHOLD, ROLE_REVIEW_FORMULA_VERSION, type RoleReviewBoundary, type RoleReviewDecision } from '@/app/dramaafera/_utils/roleReview';
import type { RoleRankingSummary } from './types';
import type { RoleReviewOverview, RoleReviewGame } from '@/app/dramaafera/_utils/roleReviewTypes';
import type { RoleSettingsEdit } from '../../_utils/roleReviewTypes';
import { getSettingsDraft, prepareSettingsDraftWrite } from '../settings/settingsDraft';
import { updateRoleSettings, type RoleSettingChange } from '../../host/_utils/roleSettings';
import { CURRENT_SEASON } from '../../_constants/seasons';

interface CycleRow { openStart: number; id: number; roleName: string; afterTime: string | Date; afterGameId: number; revision: number }
interface GameRow { id: number; gameIdentifier: string; startTime: string | Date }
interface HistoryRow {
    openStart: number;
    id: number; roleName: string; decision: RoleReviewDecision; note: string; author: string;
    createdAt: string | Date; fromTime: string | Date; fromGameId: number;
    throughTime: string | Date; throughGameId: number; snapshot: string; formulaVersion: string;
}
function readSnapshot(value: string): { stats: RoleRankingSummary | null; assessment: { label: string; className: string }; settingsChanges?: RoleSettingChange[] } {
    const saved = JSON.parse(value) as { stats: RoleRankingSummary | null; assessment: { label: string; className: string }; settingsChanges?: RoleSettingChange[] } | RoleRankingSummary | null;
    if (saved && 'stats' in saved) return saved;
    return { stats: saved, assessment: getRoleAssessment(saved?.strength ?? null, saved?.strengthGames ?? 0) };
}
const EMPTY_BOUNDARY: RoleReviewBoundary = { time: '', gameId: 0 };

async function sampleToken(stats: RoleRankingSummary | null, after: RoleReviewBoundary | null, through: RoleReviewBoundary | null): Promise<string> {
    const bytes = new TextEncoder().encode(JSON.stringify({ stats, after, through, formula: ROLE_REVIEW_FORMULA_VERSION }));
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, '0')).join('');
}

export async function getRoleBalanceOverview(season: number, throughGameId?: number, { includeHistory = true }: { includeHistory?: boolean } = {}): Promise<RoleReviewOverview> {
    const prisma = await getDatabaseClient();
    if (!prisma) return { rows: [], games: [], sessions: [], through: null };
    const [rawCycles, rawGames, histories] = await Promise.all([
        prisma.$queryRaw<CycleRow[]>`SELECT id, roleName, afterTime, afterGameId, revision, CASE WHEN afterTime = '' THEN 1 ELSE 0 END AS openStart FROM role_balance_cycles WHERE season = ${season} AND deletedAt IS NULL`,
        prisma.$queryRaw<GameRow[]>`SELECT id, gameIdentifier, startTime FROM games WHERE season = ${season} AND deletedAt IS NULL`,
        includeHistory ? prisma.$queryRaw<HistoryRow[]>`SELECT id, roleName, decision, note, author, createdAt, fromTime, fromGameId, throughTime, throughGameId, snapshot, formulaVersion, CASE WHEN fromTime = '' THEN 1 ELSE 0 END AS openStart FROM role_balance_reviews WHERE season = ${season} AND deletedAt IS NULL ORDER BY id DESC` : [],
    ]);
    // Prisma raw queries can decode time-named fields into Date objects, including TEXT columns.
    const cycles = rawCycles.map(c => ({ ...c, afterTime: c.openStart ? '' : toReviewTime(c.afterTime) }));
    const games: RoleReviewGame[] = rawGames.map(g => {
        const time = toReviewTime(g.startTime);
        const date = /^\d{8}_/.test(g.gameIdentifier) ? g.gameIdentifier.slice(0, 8) : time.slice(0, 10).replaceAll('-', '');
        return { time, gameId: g.id, identifier: g.gameIdentifier, session: date };
    }).sort(compareReviewBoundary);
    const sessionMap = new Map<string, { key: string; firstGameId: number; lastGameId: number }>();
    for (const game of games) {
        const session = sessionMap.get(game.session);
        if (session) session.lastGameId = game.gameId;
        else sessionMap.set(game.session, { key: game.session, firstGameId: game.gameId, lastGameId: game.gameId });
    }
    const through = throughGameId === undefined ? games.at(-1) ?? null : games.find(g => g.gameId === throughGameId) ?? null;
    if (throughGameId !== undefined && !through) throw new Error('Wybrana gra nie istnieje w tym sezonie. Odśwież dane.');
    const roleWindows = Object.fromEntries(cycles.map(c => [c.roleName, { after: { time: c.afterTime, gameId: c.afterGameId }, through: through ?? undefined }]));
    const stats = await generateRoleRankingStats(season, undefined, undefined, false, { includeStrength: true, roleWindows, reviewThrough: through ?? undefined });
    const statsMap = new Map(stats.map(({ players: _players, ...stat }) => [stat.name, stat]));
    const cycleMap = new Map(cycles.map(c => [c.roleName, c]));
    const roleNames = new Set([...statsMap.keys(), ...cycleMap.keys()]);
    const rows = await Promise.all(Array.from(roleNames, async roleName => {
        const cycle = cycleMap.get(roleName);
        const after = cycle ? { time: cycle.afterTime, gameId: cycle.afterGameId } : null;
        const stat = cycle ? statsMap.get(roleName) ?? null : null;
        return {
            roleName, displayName: convertRoleNameForDisplay(roleName), color: getRoleColor(roleName, season),
            revision: cycle?.revision ?? null, after, stats: stat,
            sampleToken: await sampleToken(stat, after, through),
            history: histories.filter(h => h.roleName === roleName).map(h => ({
                id: h.id, decision: h.decision, note: h.note, author: h.author, createdAt: toReviewTime(h.createdAt),
                from: { time: h.openStart ? '' : toReviewTime(h.fromTime), gameId: h.fromGameId },
                through: { time: toReviewTime(h.throughTime), gameId: h.throughGameId },
                ...readSnapshot(h.snapshot), formulaVersion: h.formulaVersion,
            })),
        };
    }));
    rows.sort((a, b) => Number((b.stats?.gamesPlayed ?? 0) >= ROLE_REVIEW_THRESHOLD) - Number((a.stats?.gamesPlayed ?? 0) >= ROLE_REVIEW_THRESHOLD) || a.displayName.localeCompare(b.displayName, 'pl'));
    return { rows, games, sessions: Array.from(sessionMap.values()).reverse(), through };
}

export async function initializeRoleBalanceCycles(season: number, firstGameId: number, author: string, roleName?: string): Promise<void> {
    const overview = await getRoleBalanceOverview(season, undefined, { includeHistory: false });
    const index = overview.games.findIndex(g => g.gameId === firstGameId);
    if (index < 0 || !overview.sessions.some(s => s.firstGameId === firstGameId)) throw new Error('Wybierz początek sesji z tego sezonu.');
    const after = overview.games[index - 1] ?? EMPTY_BOUNDARY;
    const rows = overview.rows.filter(r => r.revision === null && (!roleName || r.roleName === roleName));
    if (roleName && !rows.length) throw new Error('Rola ma już aktywną próbę albo nie występuje w sezonie.');
    if (!rows.length) return;
    const { env } = await getCloudflareContext();
    await env.DB.batch(rows.map(row => env.DB.prepare(
        'INSERT INTO role_balance_cycles (season, roleName, afterTime, afterGameId, revision, startedBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, 0, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING'
    ).bind(season, row.roleName, after.time, after.gameId, author)));
}

export interface SaveRoleBalanceReview {
    season: number; roleName: string; revision: number; throughGameId: number;
    decision: RoleReviewDecision; note: string; sampleToken: string;
    settingsEdit?: RoleSettingsEdit;
}

export async function saveRoleBalanceReview(input: SaveRoleBalanceReview, author: string): Promise<void> {
    const overview = await getRoleBalanceOverview(input.season, undefined, { includeHistory: false });
    if (overview.through && overview.through.gameId !== input.throughGameId) throw new Error('Pojawiła się nowsza gra. Odśwież ocenę przed zatwierdzeniem.');
    const row = overview.rows.find(r => r.roleName === input.roleName);
    if (!row || row.revision === null || !row.after || !overview.through) throw new Error('Najpierw rozpocznij próbę tej roli.');
    if (row.revision !== input.revision || row.sampleToken !== input.sampleToken) throw new Error('Dane przeglądu zmieniły się. Odśwież i sprawdź ocenę ponownie.');
    if (compareReviewBoundary(overview.through, row.after) <= 0) throw new Error('Granica nowej próby musi być późniejsza od poprzedniej.');
    const { env } = await getCloudflareContext();
    const through = overview.through;
    let settingsChanges: RoleSettingChange[] = [];
    let draftStatement: D1PreparedStatement | undefined;
    let draftGuard = '';
    const draftBindings: (string | number)[] = [];
    if (input.settingsEdit) {
        if (input.season !== CURRENT_SEASON) throw new Error('Nieprawidłowy sezon do edycji ustawień.');
        const draft = await getSettingsDraft();
        if (draft.token !== input.settingsEdit.token) throw new Error('Draft zmienił się. Wczytaj ponownie ustawienia roli i sprawdź zmiany.');
        const updated = updateRoleSettings(draft.content, input.roleName, input.settingsEdit.changes);
        settingsChanges = updated.changes;
        if (input.decision === 'unchanged' && settingsChanges.length) throw new Error('Bez zmian nie może zawierać zmian ustawień. Wybierz inną decyzję.');
        if (settingsChanges.length) {
            draftStatement = prepareSettingsDraftWrite(env.DB, updated.content, draft.token, true);
            const [type, id, revision] = draft.token.split(':');
            draftGuard = ` AND EXISTS (SELECT 1 FROM drama_afera_settings WHERE id = ? AND revision = ? AND versionType = ? AND deletedAt IS NULL)
                AND (? = 'draft' OR NOT EXISTS (SELECT 1 FROM drama_afera_settings WHERE versionType = 'draft' AND deletedAt IS NULL))`;
            draftBindings.push(Number(id), Number(revision), type, type);
        }
    }
    const results = await env.DB.batch([
        env.DB.prepare(`INSERT INTO role_balance_reviews
            (season, roleName, revision, fromTime, fromGameId, throughTime, throughGameId, decision, note, author, snapshot, formulaVersion, createdAt, updatedAt)
            SELECT season, roleName, revision, afterTime, afterGameId, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            FROM role_balance_cycles WHERE season = ? AND roleName = ? AND revision = ? AND deletedAt IS NULL
            AND NOT EXISTS (SELECT 1 FROM games WHERE season = ? AND deletedAt IS NULL
                AND (julianday(startTime) > julianday(?) OR (julianday(startTime) = julianday(?) AND id > ?)))${draftGuard}`)
            .bind(through.time, through.gameId, input.decision, input.note.trim(), author, JSON.stringify({ stats: row.stats, assessment: getRoleAssessment(row.stats?.strength ?? null, row.stats?.strengthGames ?? 0), settingsChanges }), ROLE_REVIEW_FORMULA_VERSION, input.season, input.roleName, input.revision, input.season, through.time, through.time, through.gameId, ...draftBindings),
        env.DB.prepare(`UPDATE role_balance_cycles SET afterTime = ?, afterGameId = ?, revision = revision + 1, updatedAt = CURRENT_TIMESTAMP
            WHERE season = ? AND roleName = ? AND revision = ? AND deletedAt IS NULL AND changes() = 1`)
            .bind(through.time, through.gameId, input.season, input.roleName, input.revision),
        ...(draftStatement ? [draftStatement] : []),
    ]);
    if (results[0].meta.changes !== 1 || results[1].meta.changes !== 1) throw new Error('Dane przeglądu zmieniły się. Odśwież i sprawdź ocenę ponownie.');
}
