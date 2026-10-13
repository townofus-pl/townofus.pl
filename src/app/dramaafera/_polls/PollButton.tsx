'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AvatarImageSized } from '../_components/PodsumowanieClient/AvatarImage';
import type { PollCandidate } from './rules';
import type { PollView } from './types';

interface PollData { poll: PollView | null; canCreate?: boolean; candidates?: PollCandidate[] }
interface VoterPage { voters: { playerId: number; nickname: string }[]; hasMore: boolean }

export default function PollButton({ date, season }: { date: string; season: number }) {
    const [data, setData] = useState<PollData | null>(null);
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [voters, setVoters] = useState<Record<number, VoterPage>>({});
    const [candidateOrder, setCandidateOrder] = useState<number[]>([]);
    const button = useRef<HTMLButtonElement>(null);
    const dialog = useRef<HTMLDivElement>(null);
    const content = useRef<HTMLDivElement>(null);
    const endpoint = `/dramaafera/ankiety?date=${date}&season=${season}`;
    const load = useCallback(async (signal?: AbortSignal) => {
        const response = await fetch(endpoint, { cache: 'no-store', signal });
        if (!response.ok) throw new Error('Nie udało się odczytać ankiety.');
        setData(await response.json());
    }, [endpoint]);
    useEffect(() => {
        const controller = new AbortController();
        void load(controller.signal).catch(() => {});
        const refresh = () => { void load(controller.signal).catch(() => {}); };
        window.addEventListener('dramaafera-account-change', refresh);
        window.addEventListener('focus', refresh);
        return () => { controller.abort(); window.removeEventListener('dramaafera-account-change', refresh); window.removeEventListener('focus', refresh); };
    }, [load]);
    useEffect(() => {
        if (!open) return;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.current?.focus();
        const key = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
            if (event.key !== 'Tab') return;
            const elements = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],summary,[tabindex="0"]') ?? []);
            const first = elements[0], last = elements.at(-1);
            if (!first) { event.preventDefault(); return; }
            if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', key);
        const controller = new AbortController();
        const refresh = () => { if (!document.hidden) void load(controller.signal).catch(() => setMessage('Nie udało się odświeżyć wyników.')); };
        refresh();
        const interval = window.setInterval(refresh, 30000);
        return () => { controller.abort(); clearInterval(interval); document.removeEventListener('keydown', key); document.body.style.overflow = overflow; button.current?.focus(); };
    }, [open, load]);

    async function submit(action: 'create' | 'vote', candidateId?: number) {
        setBusy(true); setMessage('');
        try {
            const response = await fetch('/dramaafera/ankiety', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date, season, action, candidateId }) });
            const result = await response.json() as { error?: string };
            if (!response.ok) throw new Error(result.error ?? 'Nie udało się zapisać.');
            setVoters({});
            await load();
            if (action === 'create') {
                dialog.current?.focus();
                if (content.current) content.current.scrollTop = 0;
            }
            setMessage(action === 'create' ? 'Ankieta utworzona.' : 'Twój głos został zapisany.');
        } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Nie udało się zapisać.'); }
        finally { setBusy(false); }
    }
    async function showVoters(candidateId: number, more = false) {
        try {
            const offset = more ? voters[candidateId]?.voters.length ?? 0 : 0;
            const response = await fetch(`${endpoint}&candidate=${candidateId}&offset=${offset}`, { cache: 'no-store' });
            if (!response.ok) throw new Error('Nie udało się odczytać głosujących.');
            const page = await response.json() as VoterPage;
            setVoters(current => ({ ...current, [candidateId]: { ...page, voters: more ? [...(current[candidateId]?.voters ?? []), ...page.voters] : page.voters } }));
        } catch { setMessage('Nie udało się odczytać głosujących.'); }
    }
    useEffect(() => {
        if (!open || !data?.poll) return;
        const controller = new AbortController();
        // Refresh alongside the poll response, and fetch only candidates with votes.
        void Promise.all(data.poll.candidates.map(async candidate => {
            if (candidate.votes === 0) {
                setVoters(current => ({ ...current, [candidate.id]: { voters: [], hasMore: false } }));
                return;
            }
            try {
                const response = await fetch(`${endpoint}&candidate=${candidate.id}&offset=0`, { cache: 'no-store', signal: controller.signal });
                if (!response.ok) throw new Error('Nie udało się odczytać głosujących.');
                const page = await response.json() as VoterPage;
                if (!controller.signal.aborted) setVoters(current => ({ ...current, [candidate.id]: page }));
            } catch {
                if (!controller.signal.aborted) setMessage('Nie udało się odczytać głosujących.');
            }
        }));
        return () => controller.abort();
    }, [open, data?.poll, endpoint]);
    if (!data || (!data.poll && !data.canCreate)) return null;
    const poll = data.poll;
    const closed = poll?.closed || (poll ? Date.now() >= poll.closesAt : false);
    const availableCandidates = poll?.candidates ?? data.candidates ?? [];
    const positions = new Map(candidateOrder.map((id, index) => [id, index]));
    const candidates = [...availableCandidates].sort((a, b) =>
        (positions.get(a.playerId) ?? Infinity) - (positions.get(b.playerId) ?? Infinity));
    function openPoll() {
        const order = availableCandidates.map(candidate => candidate.playerId);
        for (let index = order.length - 1; index > 0; index--) {
            const other = Math.floor(Math.random() * (index + 1));
            [order[index], order[other]] = [order[other], order[index]];
        }
        setCandidateOrder(order);
        setMessage(''); setVoters({}); setOpen(true);
    }
    const maxVotes = poll ? Math.max(0, ...poll.candidates.map(c => c.votes)) : 0;
    return <div className="flex justify-center mt-5 font-barlow">
        <button ref={button} onClick={openPoll} className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-6 py-3 font-semibold text-amber-200 hover:bg-amber-400/20 focus-visible:outline focus-visible:outline-amber-300">
            {poll ? 'Ankieta' : 'Utwórz ankietę'}
        </button>
        {open && createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
            <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="emperor-title" tabIndex={-1} className="flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-2xl border border-zinc-700 bg-zinc-950 text-white shadow-2xl outline-none font-barlow">
                <div className="flex items-start justify-between gap-4 border-b border-zinc-800 p-5">
                    <div><p className="text-sm text-amber-300">Drama Afera · {date.slice(6)}.{date.slice(4, 6)}.{date.slice(0, 4)}</p><h2 id="emperor-title" className="font-brook text-3xl">{poll ? 'Kto zostanie Emperorem?' : 'Utwórz ankietę Emperora'}</h2></div>
                    <button aria-label="Zamknij ankietę" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-xl hover:bg-zinc-800">×</button>
                </div>
                <div ref={content} className="overflow-y-auto p-5 space-y-4">
                    {poll ? <div className="rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300">
                        <p>{closed ? 'Głosowanie zakończone' : 'Możesz zmieniać wybór do zamknięcia ankiety.'}</p>
                        <p>Termin: {new Date(poll.closesAt).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw', dateStyle: 'long', timeStyle: 'short' })} (czas polski)</p>
                        <p className="mt-2">Oddano głosów: <strong>{poll.totalVotes}</strong>. Głosy są jawne.</p>
                        {poll.playerId === null && !closed && <p className="mt-2"><Link href="/dramaafera/konto" className="text-amber-300 underline">Zaloguj się i powiąż profil gracza</Link>, aby zagłosować.</p>}
                        {closed && maxVotes > 0 && <p className="mt-2 text-amber-200">{poll.candidates.filter(c => c.votes === maxVotes).length > 1 ? 'Równorzędni zwycięzcy' : 'Zwycięzca'}: {poll.candidates.filter(c => c.votes === maxVotes).map(c => c.nickname).join(', ')}</p>}
                    </div> : <p className="text-zinc-300">Kandydaci to top 10 według sumy punktów z tego dnia, wraz z remisami. Lista zostanie zapisana przy utworzeniu i nie zmieni się po korektach meczów.</p>}
                    {candidates.map(candidate => {
                        const result = poll?.candidates.find(c => c.playerId === candidate.playerId);
                        const selected = !!result && poll?.selectedCandidateId === result.id;
                        const self = poll?.playerId === candidate.playerId;
                        const percentage = poll?.totalVotes && result ? Math.round(result.votes / poll.totalVotes * 100) : 0;
                        return <div key={candidate.playerId} className={`rounded-xl border p-4 ${selected ? 'border-amber-300 bg-amber-300/10' : 'border-zinc-800 bg-zinc-900/60'}`}>
                            <div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3">
                                <AvatarImageSized nickname={candidate.nickname} size={48} className="shrink-0 rounded-full object-cover" />
                                <p className="min-w-0 break-words font-semibold">{candidate.nickname}{self ? ' (Ty)' : ''}</p>
                            </div>
                                {result && <div className="flex shrink-0 items-center gap-3">
                                    <div className="text-right" aria-label={`${result.votes} głosów, ${percentage}%`}>
                                        <span className="text-lg font-semibold text-amber-200 tabular-nums">{result.votes}</span>
                                        <span className="block text-xs text-zinc-400">{percentage}%</span>
                                    </div>
                                    <button disabled={busy || closed || self || poll?.playerId === null || selected} aria-pressed={selected} onClick={() => void submit('vote', result.id)} className="rounded-lg bg-amber-300 px-3 py-2 text-sm font-semibold text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-400">{selected ? 'Twój głos' : self ? 'To Ty' : 'Głosuj'}</button>
                                </div>}
                            </div>
                            {result && result.votes > 0 && <div className="mt-3">
                                {voters[result.id] ? <>
                                    <ul aria-label={`Głosy na ${candidate.nickname}`} className="flex flex-wrap gap-2">
                                        {voters[result.id].voters.map(v => <li key={v.playerId}>
                                            <Link href={`/dramaafera/gracz/${v.playerId}`} title={v.nickname} aria-label={`Profil głosującego: ${v.nickname}`} className="block rounded-full ring-1 ring-zinc-700 transition hover:ring-amber-300 focus-visible:outline focus-visible:outline-amber-300">
                                                <AvatarImageSized nickname={v.nickname} size={32} className="rounded-full object-cover" />
                                            </Link>
                                        </li>)}
                                    </ul>
                                    {voters[result.id].hasMore && <button onClick={() => void showVoters(result.id, true)} className="mt-2 text-sm text-amber-200 underline">Pokaż kolejnych</button>}
                                </> : <p className="text-sm text-zinc-400">Wczytywanie głosujących…</p>}
                            </div>}
                        </div>;
                    })}
                    {!poll && <button disabled={busy || candidates.length === 0} onClick={() => void submit('create')} className="w-full rounded-xl bg-amber-300 px-4 py-3 font-semibold text-zinc-950 disabled:opacity-40">{busy ? 'Tworzenie…' : candidates.length ? 'Utwórz ankietę z tymi kandydatami' : 'Brak kandydatów'}</button>}
                    <p role="status" className="text-sm text-amber-200">{message}</p>
                </div>
            </div>
        </div>, document.body)}
    </div>;
}
