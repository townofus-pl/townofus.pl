'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AvatarImageSized } from '../_components/PodsumowanieClient/AvatarImage';
import type { SignupView } from '../_signups/types';

export default function SignupsClient() {
    const [data, setData] = useState<SignupView | null>(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [busy, setBusy] = useState(false);
    const refresh = useCallback(async () => {
        const response = await fetch('/dramaafera/zapisy/api', { cache: 'no-store' });
        if (!response.ok) throw new Error('Nie udało się pobrać zapisów. Spróbuj ponownie.');
        const fresh = await response.json() as SignupView;
        setData(fresh);
        setError('');
    }, []);

    useEffect(() => {
        const load = () => { void refresh().catch(e => setError(e instanceof Error ? e.message : 'Błąd pobierania zapisów.')); };
        load();
        const interval = setInterval(load, 30000);
        window.addEventListener('focus', load);
        window.addEventListener('dramaafera-account-change', load);
        return () => { clearInterval(interval); window.removeEventListener('focus', load); window.removeEventListener('dramaafera-account-change', load); };
    }, [refresh]);

    useEffect(() => {
        if (!data) return;
        const timer = setTimeout(() => {
            setNotice('Rozpoczęły się zapisy na kolejną środę.');
            setData(null);
            void refresh().catch(() => setError('Odśwież stronę, aby zobaczyć nowy termin.'));
        }, Math.max(0, data.roster.closesAt - Date.now()));
        return () => clearTimeout(timer);
    }, [data, refresh]);

    async function change(action: 'join' | 'leave') {
        if (!data || busy) return;
        setBusy(true); setError(''); setNotice('');
        try {
            const response = await fetch('/dramaafera/zapisy/api', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, date: data.roster.date }),
            });
            const result = await response.json() as { error?: string };
            if (!response.ok) throw new Error(result.error ?? 'Nie udało się zmienić zapisu.');
            await refresh();
            setNotice(action === 'join' ? 'Jesteś na liście. Do zobaczenia w środę!' : 'Twój zapis został usunięty.');
        } catch (e) { setError(e instanceof Error ? e.message : 'Błąd zapisu.'); }
        finally { setBusy(false); }
    }

    const signedUp = !!data?.player && data.roster.playerNames.includes(data.player.name);
    return (
        <main className="mx-auto max-w-4xl px-4 py-8 font-barlow text-white">
            <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/40 to-zinc-900 p-6 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Widzimy się w środę</p>
                <h1 className="mt-2 font-brook text-5xl">Zapisy</h1>
                <p className="mt-3 text-zinc-300">Dołącz do Listy Cweli na najbliższą sesję.</p>
                {data && <p className="mt-5 text-xl font-semibold text-amber-300">{data.roster.displayDate}</p>}
                <p className="mt-2 text-sm text-zinc-400">W każdą środę o 22:00 zapisy przechodzą na kolejny tydzień. Czas polski.</p>
                {data && <div className="mt-6">
                    {!data.loggedIn ? <Link href="/dramaafera/auth/login" className="inline-flex rounded-xl bg-amber-500 px-5 py-3 font-bold text-zinc-950 hover:bg-amber-400">Zaloguj się przez Discord</Link>
                        : !data.player ? <div className="text-zinc-300">Najpierw powiąż konto z graczem, aby zapisać się pod swoim nickiem. <Link href="/dramaafera/konto" className="font-semibold text-amber-400 underline">Przejdź do konta</Link></div>
                        : <div className="flex flex-wrap items-center gap-4">
                            <AvatarImageSized nickname={data.player.name} size={48} className="rounded-full object-cover" />
                            <div><p className="font-semibold">{data.player.name}</p><p className="text-sm text-zinc-400">{signedUp ? 'Jesteś na liście' : 'Jeszcze nie jesteś na liście'}</p></div>
                            <button disabled={busy} onClick={() => void change(signedUp ? 'leave' : 'join')} className={`rounded-xl px-5 py-3 font-bold transition-colors disabled:opacity-50 ${signedUp ? 'border border-zinc-600 bg-zinc-800 hover:bg-zinc-700' : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'}`}>
                                {busy ? 'Zapisywanie…' : signedUp ? 'Wypisz się' : 'Zapisz się na środę'}
                            </button>
                        </div>}
                </div>}
            </div>
            <div aria-live="polite" className="mt-4">
                {error && <p role="alert" className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-300">{error} <button onClick={() => void refresh().catch(() => {})} className="underline">Odśwież</button></p>}
                {notice && <p className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-4 text-emerald-300">{notice}</p>}
            </div>
            <section className="mt-8">
                <div className="mb-5 flex items-center justify-between gap-4"><h2 className="font-brook text-3xl">Lista Cweli</h2><span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300">{data?.roster.playerNames.length ?? 0} graczy</span></div>
                {!data ? <p className="text-zinc-400">Wczytywanie zapisów…</p> : data.roster.playerNames.length === 0 ? <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center text-zinc-400">Lista jest jeszcze pusta. Zapisz się jako pierwszy!</div>
                    : <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.roster.playerNames.map(name => <li key={name} className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4"><AvatarImageSized nickname={name} size={40} className="rounded-full object-cover" /><span className="truncate font-semibold">{name}</span>{data.player?.name === name && <span className="ml-auto text-xs text-amber-400">Ty</span>}</li>)}</ul>}
            </section>
        </main>
    );
}
