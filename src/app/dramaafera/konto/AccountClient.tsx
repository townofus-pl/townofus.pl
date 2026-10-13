'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
interface Player {
    id: number;
    name: string;
    games: number;
    seasons: string | null;
    lastGame: string | number | null;
}
interface Account {
    username: string;
    avatarUrl: string | null;
    player: { id: number; name: string } | null;
    retryBlocked: boolean;
    requests: { id: number; playerId: number; status: string; name: string }[];
}
const labels: Record<string, string> = {
    pending: 'Oczekuje na weryfikację',
    approved: 'Zatwierdzono',
    rejected: 'Odrzucono',
    superseded: 'Zastąpiono korektą hosta',
};
export default function AccountClient() {
    const [account, setAccount] = useState<Account | null | undefined>(undefined),
        [query, setQuery] = useState(''),
        [players, setPlayers] = useState<Player[]>([]),
        [cursor, setCursor] = useState<number | null>(null),
        [message, setMessage] = useState(''),
        [busy, setBusy] = useState(false);
    async function load() {
        const r = await fetch('/dramaafera/konto/api', { cache: 'no-store' });
        const j = (await r.json()) as { error?: string; data: Account | null };
        if (!r.ok) throw new Error(j.error ?? 'Operacja nie powiodła się.');
        setAccount(j.data);
    }
    useEffect(() => {
        load().catch(() => setMessage('Nie udało się pobrać konta.'));
    }, []);
    async function run(work: () => Promise<void>) {
        setBusy(true);
        setMessage('');
        try {
            await work();
        } catch (e) {
            setMessage(e instanceof Error ? e.message : 'Operacja nie powiodła się.');
        } finally {
            setBusy(false);
        }
    }
    async function mutate(url: string, method: string, body?: unknown) {
        const r = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        const j = (await r.json()) as { error?: string };
        if (!r.ok) throw new Error(j.error ?? 'Operacja nie powiodła się.');
        await load();
        window.dispatchEvent(new Event('dramaafera-account-change'));
        setPlayers([]);
    }
    async function search(next = 0) {
        const r = await fetch(
            `/dramaafera/konto/szukaj?q=${encodeURIComponent(query)}&cursor=${next}`,
            { cache: 'no-store' },
        );
        const j = (await r.json()) as {
            error?: string;
            data: { players: Player[]; nextCursor: number | null };
        };
        if (!r.ok) throw new Error(j.error ?? 'Operacja nie powiodła się.');
        setPlayers(j.data.players);
        setCursor(j.data.nextCursor);
    }
    const pendingRequest = account?.requests.find((r) => r.status === 'pending');
    const pending = !!pendingRequest;
    const button =
        'inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400';
    const primary = `${button} bg-cyan-400 text-zinc-950 hover:bg-cyan-300`;
    const secondary = `${button} border border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:bg-zinc-700`;
    const statusLabel = account?.player
        ? 'Profil przypisany'
        : account?.retryBlocked
          ? 'Wymagana zgoda hosta'
          : pending
            ? 'Oczekuje na weryfikację'
            : 'Wybierz swój profil';
    const statusColor = account?.player
        ? 'text-emerald-300 border-emerald-400/20 bg-emerald-400/10'
        : account?.retryBlocked
          ? 'text-rose-300 border-rose-400/20 bg-rose-400/10'
          : pending
            ? 'text-amber-300 border-amber-400/20 bg-amber-400/10'
            : 'text-cyan-300 border-cyan-400/20 bg-cyan-400/10';
    return (
        <section className="font-barlow overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm">
            <div className="border-b border-zinc-800 bg-gradient-to-r from-cyan-950/30 via-zinc-900/20 to-transparent px-6 py-8 sm:px-8">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    Drama Afera
                </p>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="font-brook text-4xl sm:text-5xl">Moje konto</h1>
                        <p className="mt-2 max-w-xl text-zinc-400">
                            Twój Discord, Twój profil i cała historia rozgrywek.
                        </p>
                    </div>
                    {account && (
                        <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${statusColor}`}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {statusLabel}
                        </span>
                    )}
                </div>
            </div>
            <div className="space-y-6 p-6 sm:p-8">
                {message && (
                    <div
                        role="status"
                        className="rounded-xl border border-zinc-600 bg-zinc-800/70 px-4 py-3 text-sm text-zinc-200"
                    >
                        {message}
                    </div>
                )}
                {account === undefined ? (
                    <div className="animate-pulse space-y-3 py-4" aria-label="Ładowanie konta">
                        <div className="h-5 w-40 rounded bg-zinc-800" />
                        <div className="h-24 rounded-xl bg-zinc-800/60" />
                    </div>
                ) : !account ? (
                    <div className="grid gap-8 py-2 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
                        <div className="space-y-5">
                            <h2 className="font-brook text-3xl">Dołącz do swojego profilu</h2>
                            <p className="max-w-lg leading-relaxed text-zinc-400">
                                Zaloguj się przez Discord i wybierz profil, pod którym grasz w Drama
                                Aferze. Po weryfikacji przez hosta będzie przypisany do Twojego
                                konta.
                            </p>
                            <a
                                className={`${button} bg-indigo-500 text-white hover:bg-indigo-400`}
                                href="/dramaafera/auth/login"
                            >
                                Zaloguj przez Discord{' '}
                                <span aria-hidden="true" className="ml-3">
                                    →
                                </span>
                            </a>
                            <p className="text-sm text-zinc-500">
                                Ranking i statystyki możesz przeglądać również bez logowania.
                            </p>
                        </div>
                        <ol className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-950/30 p-6">
                            {[
                                ['Zaloguj się', 'Użyj swojego konta Discord.'],
                                ['Znajdź swój profil', 'Porównaj nick, sezony i historię gier.'],
                                ['Poczekaj na hosta', 'Host sprawdzi i zatwierdzi powiązanie.'],
                            ].map(([title, description], index) => (
                                <li key={title} className="flex gap-4">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-sm text-cyan-300">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="font-semibold text-zinc-200">{title}</p>
                                        <p className="mt-1 text-sm text-zinc-500">{description}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/30 p-5">
                            <div className="flex items-center gap-4">
                                {account.avatarUrl ? (
                                    <Image
                                        src={account.avatarUrl}
                                        alt=""
                                        width={48}
                                        height={48}
                                        unoptimized
                                        className="h-12 w-12 rounded-2xl"
                                    />
                                ) : (
                                    <span
                                        aria-hidden="true"
                                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-xl font-semibold text-indigo-300"
                                    >
                                        {account.username.slice(0, 1).toUpperCase()}
                                    </span>
                                )}

                                <div>
                                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                                        Konto Discord
                                    </p>
                                    <p className="mt-1 text-lg font-semibold">{account.username}</p>
                                </div>
                            </div>
                            <button
                                className={`${secondary} !py-2 text-sm`}
                                disabled={busy}
                                onClick={() =>
                                    void run(() => mutate('/dramaafera/auth/logout', 'POST'))
                                }
                            >
                                Wyloguj się
                            </button>
                        </div>
                        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                            <div className="space-y-6">
                                {account.player ? (
                                    <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-6">
                                        <p className="text-sm text-emerald-300">
                                            Twój profil gracza
                                        </p>
                                        <h2 className="my-3 font-brook text-4xl">
                                            {account.player.name}
                                        </h2>
                                        <p className="mb-5 text-sm leading-relaxed text-zinc-400">
                                            Profil jest przypisany do Twojego konta. Wszystkie
                                            sezony i wyniki znajdziesz w jednym miejscu.
                                        </p>
                                        <Link
                                            className={primary}
                                            href={`/dramaafera/gracz/${account.player.id}`}
                                        >
                                            Przejdź do profilu{' '}
                                            <span className="ml-3" aria-hidden="true">
                                                →
                                            </span>
                                        </Link>
                                    </div>
                                ) : account.retryBlocked ? (
                                    <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-6">
                                        <h2 className="font-brook text-3xl">
                                            Porozmawiaj z hostem
                                        </h2>
                                        <p className="mt-3 leading-relaxed text-zinc-400">
                                            Twoja prośba została odrzucona. Aby wysłać kolejną,
                                            poproś hosta o zgodę na ponowienie.
                                        </p>
                                    </div>
                                ) : pending ? (
                                    <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-6">
                                        <p className="text-sm text-amber-300">
                                            Prośba została wysłana
                                        </p>
                                        <h2 className="mt-3 font-brook text-3xl">
                                            Czekamy na decyzję hosta
                                        </h2>
                                        <p className="mt-3 leading-relaxed text-zinc-400">
                                            Host sprawdzi, czy profil{' '}
                                            <strong className="text-zinc-200">
                                                {pendingRequest?.name}
                                            </strong>{' '}
                                            należy do Ciebie. Decyzja pojawi się na tej stronie.
                                        </p>
                                        {pendingRequest && (
                                            <Link
                                                className="mt-5 inline-block text-sm text-amber-300 hover:text-amber-200"
                                                href={`/dramaafera/gracz/${pendingRequest.playerId}`}
                                            >
                                                Zobacz wybrany profil →
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        <div>
                                            <h2 className="font-brook text-3xl">
                                                Znajdź swój profil
                                            </h2>
                                            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                                                Wpisz nick, pod którym grasz. Możesz wybrać także
                                                profil z wcześniejszych sezonów.
                                            </p>
                                        </div>
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                void run(() => search());
                                            }}
                                        >
                                            <label
                                                htmlFor="player-nick"
                                                className="mb-2 block text-sm font-medium text-zinc-300"
                                            >
                                                Nick gracza
                                            </label>
                                            <div className="flex flex-col gap-3 sm:flex-row">
                                                <input
                                                    id="player-nick"
                                                    disabled={busy}
                                                    value={query}
                                                    onChange={(e) => {
                                                        setQuery(e.target.value);
                                                        setCursor(null);
                                                    }}
                                                    minLength={2}
                                                    maxLength={80}
                                                    placeholder="Wpisz co najmniej 2 znaki…"
                                                    className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950/50 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 disabled:opacity-50"
                                                />
                                                <button
                                                    className={primary}
                                                    disabled={busy}
                                                    type="submit"
                                                >
                                                    {busy ? 'Chwileczkę…' : 'Szukaj profilu'}
                                                </button>
                                            </div>
                                        </form>
                                        {players.map((p) => (
                                            <article
                                                className="rounded-xl border border-zinc-700/70 bg-zinc-800/25 p-5"
                                                key={p.id}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <Link
                                                        className="text-xl font-semibold hover:text-cyan-300"
                                                        href={`/dramaafera/gracz/${p.id}`}
                                                    >
                                                        {p.name}
                                                    </Link>
                                                    <span className="text-xs text-zinc-500">
                                                        Profil #{p.id}
                                                    </span>
                                                </div>
                                                <dl className="my-4 grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <dt className="text-zinc-500">
                                                            Zagrane gry
                                                        </dt>
                                                        <dd className="mt-1 text-zinc-200">
                                                            {p.games}
                                                        </dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-zinc-500">Sezony</dt>
                                                        <dd className="mt-1 text-zinc-200">
                                                            {p.seasons ?? 'Brak gier'}
                                                        </dd>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <dt className="text-zinc-500">
                                                            Ostatnia gra
                                                        </dt>
                                                        <dd className="mt-1 text-zinc-200">
                                                            {p.lastGame
                                                                ? new Date(
                                                                      p.lastGame,
                                                                  ).toLocaleString('pl-PL', {
                                                                      timeZone: 'UTC',
                                                                  })
                                                                : 'Brak gier'}
                                                        </dd>
                                                    </div>
                                                </dl>
                                                <button
                                                    className={`${secondary} w-full text-sm`}
                                                    disabled={busy}
                                                    onClick={() =>
                                                        void run(async () => {
                                                            await mutate(
                                                                '/dramaafera/konto/api',
                                                                'POST',
                                                                { playerId: p.id },
                                                            );
                                                            setMessage(
                                                                'Prośba oczekuje na weryfikację hosta.',
                                                            );
                                                        })
                                                    }
                                                >
                                                    To mój profil — wyślij prośbę
                                                </button>
                                            </article>
                                        ))}
                                        {cursor !== null && (
                                            <button
                                                className={secondary}
                                                disabled={busy}
                                                onClick={() => void run(() => search(cursor))}
                                            >
                                                Pokaż kolejne profile
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <aside className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-5">
                                <h2 className="font-brook text-2xl">Jak działa przypisanie?</h2>
                                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                                    Wybierz właściwy profil na podstawie sezonów i historii gier.
                                    Host zweryfikuje Twoją prośbę.
                                </p>
                                <div className="mt-4 border-t border-zinc-800 pt-4 text-sm leading-relaxed text-zinc-500">
                                    Przypisanie konta nie zmienia wyników ani rankingu. Zmiana nicku
                                    gracza nie odłącza profilu.
                                </div>
                            </aside>
                        </div>
                        {account.requests.length > 0 && (
                            <div className="border-t border-zinc-800 pt-6">
                                <h2 className="mb-4 font-brook text-2xl">Historia próśb</h2>
                                <ul className="divide-y divide-zinc-800">
                                    {account.requests.map((r) => (
                                        <li
                                            key={r.id}
                                            className="flex flex-wrap items-center justify-between gap-3 py-3"
                                        >
                                            <Link
                                                className="text-zinc-300 hover:text-white"
                                                href={`/dramaafera/gracz/${r.playerId}`}
                                            >
                                                {r.name}
                                            </Link>
                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs ${r.status === 'pending' ? 'border-amber-400/20 bg-amber-400/10 text-amber-300' : r.status === 'approved' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : r.status === 'rejected' ? 'border-rose-400/20 bg-rose-400/10 text-rose-300' : 'border-zinc-700 bg-zinc-800 text-zinc-400'}`}
                                            >
                                                {labels[r.status] ?? r.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <details className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-5">
                            <summary className="cursor-pointer text-sm text-zinc-500 transition-colors hover:text-rose-300">
                                Zamknięcie konta
                            </summary>
                            <div className="mt-4 space-y-4">
                                <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
                                    Zamknięcie usuwa dane Discord, powiązanie, prośby, historię
                                    decyzji i wszystkie sesje. Wyniki gracza pozostają. Usuniętego
                                    konta nie można odtworzyć.
                                </p>
                                <button
                                    className={`${button} border border-rose-500/30 bg-rose-500/10 text-sm text-rose-300 hover:bg-rose-500/20`}
                                    disabled={busy}
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                'Trwale zamknąć konto i usunąć dane Discord?',
                                            )
                                        )
                                            void run(() =>
                                                mutate('/dramaafera/konto/api', 'DELETE'),
                                            );
                                    }}
                                >
                                    Trwale zamknij konto
                                </button>
                            </div>
                        </details>
                    </>
                )}
            </div>
        </section>
    );
}
