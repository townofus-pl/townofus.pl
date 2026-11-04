'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import ReviewModal from './ReviewModal';
import { RoleReviewSettingsChanges } from './RoleReviewSettingsChanges';
import RoleReviewSettingsDialog, { type PendingRoleSettings } from './RoleReviewSettingsDialog';
import type { RoleReviewHistory } from '../_utils/roleReviewTypes';
import { CURRENT_SEASON } from '../_constants/seasons';
import { getRoleIconPath } from '@/app/dramaafera/_utils/gameUtils';
import { getRoleBalanceOverviewAction, initializeRoleBalanceAction, saveRoleBalanceReviewAction } from '@/app/dramaafera/_actions/roleBalanceReviewActions';
import { ROLE_REVIEW_THRESHOLD, ROLE_REVIEW_DECISION_LABELS, compareReviewBoundary, type RoleReviewDecision } from '@/app/dramaafera/_utils/roleReview';
import type { RoleReviewOverview, RoleReviewRow } from '@/app/dramaafera/_utils/roleReviewTypes';
import { getRoleAssessment } from '@/app/dramaafera/_utils/roleStrength';

const number = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 });
const field = 'rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white disabled:opacity-50';
const button = 'rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';
const decisionTextColors: Record<RoleReviewDecision, string> = {
    buff: 'text-green-400',
    nerf: 'text-red-400',
    adjustment: 'text-purple-400',
    emperor_decree: 'text-yellow-400',
    unchanged: 'text-blue-400',
    settings_changed: 'text-blue-400',
};
function sessionLabel(key: string) { return key.slice(6, 8) + '.' + key.slice(4, 6) + '.' + key.slice(0, 4); }
function message(error: unknown) { return error instanceof Error && /^(Brak autoryzacji|Nieprawidłowy sezon|Sesja ma|Wybrana gra)/.test(error.message) ? error.message : 'Nie udało się pobrać danych. Odśwież panel i spróbuj ponownie.'; }

export default function RoleBalanceReviews({ seasonId }: { seasonId: number }) {
    const [historyInfo, setHistoryInfo] = useState<{ entry: RoleReviewHistory; role: string; roleName: string; color: string } | null>(null);
    const [data, setData] = useState<RoleReviewOverview | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [pendingOnly, setPendingOnly] = useState(false);
    const [firstGameId, setFirstGameId] = useState('');
    const request = useRef(0);
    const reload = useCallback(async () => {
        const version = ++request.current;
        setBusy(true);
        setError('');
        try {
            const next = await getRoleBalanceOverviewAction(seasonId);
            if (version !== request.current) return;
            setData(next);
            setFirstGameId(previous => previous || String(next.sessions[0]?.firstGameId ?? ''));
        } catch (e) { if (version === request.current) setError(message(e)); }
        finally { if (version === request.current) setBusy(false); }
    }, [seasonId]);
    useEffect(() => { void reload(); return () => { request.current += 1; }; }, [reload]);

    async function initialize(roleName?: string) {
        if (!firstGameId || busy) return;
        setBusy(true); setError(''); setNotice('');
        try {
            const result = await initializeRoleBalanceAction(seasonId, Number(firstGameId), roleName);
            if (!result.success) { setError(result.error); setBusy(false); return; }
            setNotice('Rozpoczęto nowe próby od wybranej sesji.');
            await reload();
        } catch (e) { setError(message(e)); setBusy(false); }
    }
    const pending = data?.rows.filter(r => (r.stats?.gamesPlayed ?? 0) >= ROLE_REVIEW_THRESHOLD).length ?? 0;
    const rows = data?.rows.filter(r => !pendingOnly || (r.stats?.gamesPlayed ?? 0) >= ROLE_REVIEW_THRESHOLD) ?? [];
    return <section className="space-y-5 rounded-xl bg-zinc-900/70 p-4 font-barlow text-white md:p-6" aria-busy={busy}>
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div><h2 className="font-brook text-3xl">Przeglądy balansu</h2><p className="text-gray-400">Sezon {seasonId} · Do przeglądu: {pending}</p></div>
            <button type="button" disabled={busy} onClick={() => void reload()} className={button}>Odśwież dane</button>
        </div>
        <p className="text-sm text-gray-300">Każda rola zbiera własną próbę od ostatniego przeglądu. Po 10 występach pojawia się do przeglądu. Ocena obejmuje wszystkie występy do najnowszej gry, także ponad 10. Zatwierdzenie „Bez zmian” również rozpoczyna nową próbę.</p>
        {error && <p role="alert" className="rounded-lg bg-red-950 p-3 text-red-300">{error}</p>}
        {notice && <p role="status" className="text-green-300">{notice}</p>}
        {!data && busy && <p role="status">Ładowanie przeglądów…</p>}
        {data && <>
            <div className="flex flex-wrap items-end gap-4">
                <p className="py-2 text-sm text-gray-300">Ostatnia gra: {data.through?.identifier ?? '—'}</p>
                <label className="flex items-center gap-2 py-2"><input type="checkbox" checked={pendingOnly} onChange={e => setPendingOnly(e.target.checked)} />Tylko do przeglądu</label>
            </div>
            <p className="text-sm text-gray-400">Ocena obejmuje dane do najnowszej gry w sezonie. Jeśli przed zatwierdzeniem dojdzie nowa gra, odśwież ocenę i sprawdź ją ponownie.</p>
            {data.rows.some(r => r.revision === null) && <div className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-700 p-4">
                <label className="flex flex-col gap-2 text-sm text-gray-300">Pierwsza sesja nowej próby
                    <select className={field} disabled={busy} value={firstGameId} onChange={e => setFirstGameId(e.target.value)}>
                        {data.sessions.map(s => <option key={s.key} value={s.firstGameId}>{sessionLabel(s.key)}</option>)}
                    </select>
                </label>
                <button type="button" className={button} disabled={busy || !firstGameId} onClick={() => void initialize()}>Rozpocznij dla nieaktywnych ról</button>
                <p className="w-full text-sm text-gray-400">Istniejące próby pozostają aktywne. Nowe role możesz uruchamiać pojedynczo poniżej.</p>
            </div>}
            <div className="space-y-3 overflow-x-auto">
                {rows.map(row => {
                    const count = row.stats?.gamesPlayed ?? 0;
                    const assessment = getRoleAssessment(row.stats?.strength ?? null, row.stats?.strengthGames ?? 0);
                    return <details key={row.roleName} className="min-w-[1120px] rounded-lg border border-zinc-700 bg-zinc-800/60 p-4">
                        <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                            <span className="grid grid-cols-[minmax(150px,1fr)_190px_145px_110px_145px_185px_90px] items-center gap-x-3 whitespace-nowrap">
                                <span className="flex min-w-0 items-center gap-2">
                                    <Image src={getRoleIconPath(row.roleName, seasonId)} alt="" width={32} height={32} className="h-8 w-8 shrink-0 object-contain" />
                                    <strong style={{ color: row.color }}>{row.displayName}</strong>
                                </span>
                                <span className={count >= ROLE_REVIEW_THRESHOLD ? 'font-semibold text-yellow-300' : 'text-gray-300'}>{row.revision === null ? 'Nie rozpoczęto' : count + '/10 · ' + (count >= ROLE_REVIEW_THRESHOLD ? 'Do przeglądu' : 'Zbieranie danych')}</span>
                                <span>Avg. DAP: {row.stats?.dapGames ? number.format(row.stats.averagePoints) : '—'}</span>
                                <span>Siła: {row.stats?.strength != null ? number.format(row.stats.strength) : '—'}</span>
                                <span className={assessment.className}>{assessment.label}</span>
                                <span className="text-sm text-gray-400">Ostatni przegląd: {row.history[0] ? new Date(row.history[0].createdAt).toLocaleDateString('pl-PL') : '—'}</span>
                                <span className="text-blue-300">Przejrzyj ▾</span>
                            </span>
                        </summary>
                        {row.revision === null
                            ? <button type="button" className={button + ' mt-4'} disabled={busy || !firstGameId} onClick={() => void initialize(row.roleName)}>Rozpocznij od wybranej sesji</button>
                            : <ReviewEditor key={row.revision} row={row} data={data} seasonId={seasonId} busy={busy} setBusy={setBusy} onError={setError} onNotice={setNotice} reload={reload} />}
                        <div className="mt-4 space-y-2 border-t border-zinc-700 pt-4">
                            <h3 className="font-brook text-xl">Historia przeglądów</h3>
                            {!row.history.length && <p className="text-sm text-gray-400">Brak zatwierdzonych przeglądów.</p>}
                            {row.history.map(entry => <article key={entry.id} className="rounded-lg bg-zinc-900 p-3 text-sm">
                                <div className="flex items-center justify-between gap-3"><p className="font-semibold"><span className={decisionTextColors[entry.decision]}>{ROLE_REVIEW_DECISION_LABELS[entry.decision]}</span> · {new Date(entry.createdAt).toLocaleString('pl-PL')} · {entry.author}</p>
                                <button type="button" aria-label={`Pokaż zmiany ustawień: ${row.displayName}`} title="Zmiany ustawień" onClick={() => setHistoryInfo({ entry, role: row.displayName, roleName: row.roleName, color: row.color })} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-400 font-bold text-blue-300 hover:bg-blue-500/20">i</button></div>
                                <p className={entry.assessment.className}>Ocena: {entry.assessment.label}</p>
                                <p className="text-gray-400">Występy: {entry.stats?.gamesPlayed ?? 0} · Siła: {entry.stats?.strength != null ? number.format(entry.stats.strength) : '—'} · Do gry: {data.games.find(g => g.gameId === entry.through.gameId)?.identifier ?? entry.through.gameId}</p>
                                {entry.note && <p className="mt-1 whitespace-pre-wrap">{entry.note}</p>}
                            </article>)}
                        </div>
                    </details>;
                })}
                {!rows.length && <p className="py-8 text-center text-gray-400">{pendingOnly ? 'Nie ma ról oczekujących na przegląd.' : 'Brak ról z występami w tym sezonie.'}</p>}
            </div>
        </>}
        {historyInfo && <ReviewModal title={`Zmiany ustawień: ${historyInfo.role}`} onClose={() => setHistoryInfo(null)}>
            <p className="mb-4 text-sm text-gray-400">{new Date(historyInfo.entry.createdAt).toLocaleString('pl-PL')} · {historyInfo.entry.author}</p>
            {historyInfo.entry.settingsChanges === undefined ? <p>Ten starszy przegląd nie zawiera zapisu zmian ustawień.</p>
                : !historyInfo.entry.settingsChanges.length ? <p>W tym przeglądzie nie zmieniono ustawień.</p>
                : <RoleReviewSettingsChanges role={historyInfo.role} color={historyInfo.color}
                    icon={getRoleIconPath(historyInfo.roleName, seasonId)} changes={historyInfo.entry.settingsChanges} />}
        </ReviewModal>}
    </section>;
}

function ReviewEditor({ row, data, seasonId, busy, setBusy, onError, onNotice, reload }: {
    row: RoleReviewRow; data: RoleReviewOverview; seasonId: number; busy: boolean;
    setBusy: (value: boolean) => void; onError: (value: string) => void; onNotice: (value: string) => void;
    reload: () => Promise<void>;
}) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsEdit, setSettingsEdit] = useState<PendingRoleSettings | null>(null);
    const [decision, setDecision] = useState<RoleReviewDecision | ''>('');
    const [note, setNote] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    useEffect(() => { setConfirmed(false); }, [data.through?.gameId, row.sampleToken]);
    const choices: RoleReviewDecision[] = ['buff', 'nerf', 'adjustment', 'emperor_decree', 'unchanged'];
    const decisionColors: Record<RoleReviewDecision, string> = {
        buff: 'bg-green-700 hover:bg-green-600',
        nerf: 'bg-red-700 hover:bg-red-600',
        adjustment: 'bg-purple-700 hover:bg-purple-600',
        emperor_decree: 'bg-yellow-500 hover:bg-yellow-400 !text-zinc-950',
        unchanged: 'bg-blue-600 hover:bg-blue-500',
        settings_changed: 'bg-blue-600 hover:bg-blue-500',
    };
    const canSubmit = row.revision !== null && data.through && row.after && compareReviewBoundary(data.through, row.after) > 0 &&
        confirmed && decision && !(decision === 'unchanged' && settingsEdit && Object.keys(settingsEdit.changes).length) && choices.includes(decision);
    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!canSubmit || !data.through || row.revision === null || !decision) return;
        setBusy(true); onError(''); onNotice('');
        try {
            const result = await saveRoleBalanceReviewAction({ season: seasonId, roleName: row.roleName, revision: row.revision,
                throughGameId: data.through.gameId, decision, note, sampleToken: row.sampleToken, confirmed,
                ...(settingsEdit && Object.keys(settingsEdit.changes).length ? { settingsEdit: { token: settingsEdit.token, changes: settingsEdit.changes } } : {}) });
            if (!result.success) { onError(result.error); setBusy(false); return; }
            onNotice('Zapisano przegląd roli ' + row.displayName + '. Rozpoczęto kolejną próbę.');
            await reload();
        } catch (error) { onError(message(error)); setBusy(false); }
    }
    return <><form onSubmit={event => void submit(event)} className="mt-4 space-y-4">
        <p className="text-sm text-gray-300">Próba po grze {row.after?.gameId || 'początkowej granicy sezonu'} do {data.through?.identifier ?? '—'}.</p>
        {seasonId === CURRENT_SEASON && <div className="flex flex-wrap items-center gap-3">
            <button type="button" disabled={busy} onClick={() => setSettingsOpen(true)} className={button}>Zmień ustawienia roli</button>
            {settingsEdit && Object.keys(settingsEdit.changes).length > 0 && <>
                <span className="text-sm text-yellow-300">Zmiany do zapisania w drafcie: {Object.keys(settingsEdit.changes).length}</span>
                <button type="button" disabled={busy} className="text-sm text-gray-300 underline" onClick={() => { setSettingsEdit(null); setConfirmed(false); }}>Odrzuć zmiany ustawień</button>
            </>}
        </div>}
        {decision === 'unchanged' && settingsEdit && Object.keys(settingsEdit.changes).length > 0 && <p role="alert" className="text-yellow-300">Wybierz Buff, Nerf, Adjustment, DEKRET EMPERORA lub odrzuć zmiany ustawień, aby zatwierdzić „Bez zmian”.</p>}
        <fieldset disabled={busy}>
            <legend className="mb-2">Decyzja</legend>
            <div className="flex flex-wrap gap-3">
                {choices.map(value => <button key={value} type="button" aria-pressed={decision === value}
                    onClick={() => { setDecision(value); setConfirmed(false); }}
                    className={'rounded-lg px-4 py-2 text-white disabled:opacity-50 ' + decisionColors[value] + (decision === value ? ' ring-2 ring-white ring-offset-2 ring-offset-zinc-800' : '')}>
                    {ROLE_REVIEW_DECISION_LABELS[value]}
                </button>)}
            </div>
        </fieldset>
        <p className="text-sm text-gray-400">Każda decyzja rozpoczyna nową próbę po najnowszej grze, również przed zebraniem 10 występów.</p>
        <label className="flex flex-col gap-2">Notatka (opcjonalna)
            <textarea className={field} rows={2} maxLength={2000} disabled={busy} value={note} onChange={e => setNote(e.target.value)} placeholder="Co zmieniono lub dlaczego pozostawiono rolę bez zmian?" />
        </label>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} className="mt-1" />
            Potwierdzam przegląd danych i rozpoczęcie nowej próby po najnowszej grze. Dołączone zmiany ustawień zostaną zapisane w drafcie.
        </label>
        <button className={button} disabled={busy || !canSubmit}>{busy ? 'Zapisywanie…' : 'Zatwierdź przegląd'}</button>
    </form>
    {settingsOpen && <RoleReviewSettingsDialog seasonId={seasonId} roleName={row.roleName} initial={settingsEdit} onClose={() => setSettingsOpen(false)} onApply={edit => { setSettingsEdit(edit); setSettingsOpen(false); setConfirmed(false); }} />}
    </>;
}
