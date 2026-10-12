'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
interface Account {
    id: number;
    username: string;
    discordUserId: string;
    playerId: number | null;
    playerName: string | null;
    retryBlocked: number;
    version: number;
    isHost: number;
}
interface LinkRequest {
    id: number;
    accountId: number;
    playerId: number;
    name: string;
    hashedProductUserId: string | null;
    friendCode: string | null;
}
interface Audit {
    id: number;
    accountId: number;
    actor: string;
    action: string;
    reason: string;
    previousPlayerId: number | null;
    newPlayerId: number | null;
    createdAt: string;
}
interface Data {
    accounts: Account[];
    requests: LinkRequest[];
    audits: Audit[];
    nextCursor: number | null;
}
export default function DiscordAccountsTab() {
    const [data, setData] = useState<Data | null>(null);
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const [cursor, setCursor] = useState(0);
    async function load(page = cursor) {
        const response = await fetch(`/dramaafera/host/konta?cursor=${page}`, {
            cache: 'no-store',
        });
        const result = (await response.json()) as { error?: string; data: Data };
        if (!response.ok) throw new Error(result.error ?? 'Operacja nie powiodła się.');
        setData(result.data);
        setCursor(page);
    }
    useEffect(() => {
        load(0).catch((e) => setMessage(e.message));
    }, []);
    type Action = 'approve' | 'reject' | 'retry' | 'correct' | 'grantHost' | 'revokeHost';
    const [decision, setDecision] = useState<{
        account: Account;
        action: Action;
        request?: LinkRequest;
    } | null>(null);
    const [reason, setReason] = useState('');
    const [confirmationNickname, setConfirmationNickname] = useState('');
    const [target, setTarget] = useState('');
    const [formError, setFormError] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'linked' | 'blocked'>('all');
    const [search, setSearch] = useState('');
    const dialogRef = useRef<HTMLFormElement>(null);
    const returnFocus = useRef<HTMLElement | null>(null);
    const button =
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400';
    const secondary = `${button} border border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:bg-zinc-700`;
    function openDecision(account: Account, action: Action, request?: LinkRequest) {
        returnFocus.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setDecision({ account, action, request });
        setReason('');
        setConfirmationNickname('');
        setTarget(account.playerId?.toString() ?? '');
        setFormError('');
    }
    function closeDecision() {
        setDecision(null);
        returnFocus.current?.focus();
    }
    async function decide() {
        if (!decision) return;
        const { account, action, request } = decision;
        if (
            ['grantHost', 'revokeHost'].includes(action) &&
            confirmationNickname !== account.username
        ) {
            setFormError('Przepisz dokładnie nick wybranej osoby.');
            return;
        }
        if (reason.trim().length < 3) {
            setFormError('Wpisz co najmniej 3 znaki uzasadnienia.');
            return;
        }
        const playerId =
            action === 'correct' ? (target.trim() === '' ? null : Number(target)) : undefined;
        if (
            playerId !== undefined &&
            playerId !== null &&
            (!Number.isSafeInteger(playerId) || playerId <= 0)
        ) {
            setFormError('Wpisz poprawny numer profilu.');
            return;
        }
        setBusy(true);
        setMessage('');
        setFormError('');
        let saved = false;
        try {
            const response = await fetch('/dramaafera/host/konta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId: account.id,
                    expectedVersion: account.version,
                    action,
                    requestId: request?.id,
                    playerId,
                    reason: reason.trim(),
                    confirmationNickname: ['grantHost', 'revokeHost'].includes(action)
                        ? confirmationNickname
                        : undefined,
                }),
            });
            const result = (await response.json()) as { error?: string };
            if (!response.ok) throw new Error(result.error ?? 'Nie udało się zapisać decyzji.');
            saved = true;
            setDecision(null);
            window.dispatchEvent(new Event('dramaafera-account-change'));
            await load();
            setMessage('Decyzja została zapisana.');
        } catch (e) {
            if (saved)
                setMessage(
                    'Decyzja została zapisana, ale lista nie została odświeżona. Sprawdź swoje uprawnienia i odśwież stronę.',
                );
            else setFormError(e instanceof Error ? e.message : 'Nie udało się zapisać decyzji.');
        } finally {
            setBusy(false);
        }
    }
    const pendingAccounts = new Set(data?.requests.map((r) => r.accountId));
    const accounts =
        data?.accounts
            .filter(
                (a) =>
                    (filter === 'all' ||
                        (filter === 'pending' && pendingAccounts.has(a.id)) ||
                        (filter === 'linked' && a.playerId !== null) ||
                        (filter === 'blocked' && !!a.retryBlocked)) &&
                    `${a.username} ${a.playerName ?? ''} ${a.discordUserId}`
                        .toLocaleLowerCase('pl-PL')
                        .includes(search.toLocaleLowerCase('pl-PL')),
            )
            .sort(
                (a, b) => Number(pendingAccounts.has(b.id)) - Number(pendingAccounts.has(a.id)),
            ) ?? [];
    return (
        <section className="font-barlow space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                        Zarządzanie społecznością
                    </p>
                    <h2 className="font-brook text-4xl">Konta Discord</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                        Sprawdź prośby graczy i przypisz właściwe profile. Oczekujące prośby
                        znajdziesz na początku listy.
                    </p>
                </div>
                <button
                    className={secondary}
                    disabled={busy}
                    onClick={() => void load().catch((e) => setMessage(e.message))}
                >
                    Odśwież listę
                </button>
            </div>
            {message && (
                <p
                    role="status"
                    className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm text-zinc-200"
                >
                    {message}
                </p>
            )}
            <div className="grid grid-cols-3 gap-3">
                {[
                    ['Oczekujące', pendingAccounts.size],
                    ['Przypisane', data?.accounts.filter((a) => a.playerId !== null).length ?? 0],
                    [
                        'Zablokowane ponowienie',
                        data?.accounts.filter((a) => a.retryBlocked).length ?? 0,
                    ],
                ].map(([label, count]) => (
                    <div
                        key={label}
                        className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
                    >
                        <p className="text-2xl font-semibold text-zinc-100">{count}</p>
                        <p className="mt-1 text-xs text-zinc-500">{label}</p>
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    {(
                        [
                            ['all', 'Wszystkie'],
                            ['pending', 'Do sprawdzenia'],
                            ['linked', 'Przypisane'],
                            ['blocked', 'Po odrzuceniu'],
                        ] as const
                    ).map(([id, label]) => (
                        <button
                            key={id}
                            disabled={busy}
                            aria-pressed={filter === id}
                            onClick={() => setFilter(id)}
                            className={`rounded-full border px-4 py-2 text-sm transition-colors ${filter === id ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300' : 'border-zinc-800 text-zinc-400 hover:text-white'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <input
                    aria-label="Szukaj na bieżącej stronie kont"
                    placeholder="Szukaj konta lub nicku…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/70 px-4 py-2.5 text-sm outline-none focus:border-cyan-400 sm:w-64"
                />
            </div>
            <p className="text-xs text-zinc-500">
                Liczby, filtry i wyszukiwanie dotyczą bieżącej strony listy.
            </p>
            {!data ? (
                <p className="rounded-xl border border-zinc-800 p-6 text-zinc-500">
                    Ładowanie kont…
                </p>
            ) : accounts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-700 p-10 text-center">
                    <h3 className="font-brook text-2xl">Brak kont do wyświetlenia</h3>
                    <p className="mt-2 text-sm text-zinc-500">
                        Zmień filtr lub przejdź do kolejnej strony listy.
                    </p>
                </div>
            ) : (
                accounts.map((account) => {
                    const requests = data.requests.filter((r) => r.accountId === account.id);
                    const badge = requests.length
                        ? 'Oczekuje na weryfikację'
                        : account.playerId
                          ? 'Profil przypisany'
                          : account.retryBlocked
                            ? 'Wymagana zgoda na ponowienie'
                            : 'Bez przypisanego profilu';
                    return (
                        <article
                            key={account.id}
                            className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 p-5 sm:p-6">
                                <div className="flex items-center gap-4">
                                    <span
                                        aria-hidden="true"
                                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-lg font-semibold text-indigo-300"
                                    >
                                        {account.username.slice(0, 1).toUpperCase()}
                                    </span>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {account.username}
                                            {!!account.isHost && (
                                                <span className="ml-2 rounded-full border border-indigo-400/25 bg-indigo-400/10 px-2 py-0.5 text-xs font-normal text-indigo-300">
                                                    Host
                                                </span>
                                            )}
                                        </h3>
                                        <p className="mt-1 text-sm text-zinc-500">
                                            {account.playerId ? (
                                                <Link
                                                    className="hover:text-cyan-300"
                                                    href={`/dramaafera/gracz/${account.playerId}`}
                                                >
                                                    Profil: {account.playerName} →
                                                </Link>
                                            ) : (
                                                'Profil nie został jeszcze przypisany'
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`rounded-full border px-3 py-1.5 text-xs ${requests.length ? 'border-amber-400/20 bg-amber-400/10 text-amber-300' : account.playerId ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-zinc-700 bg-zinc-800/40 text-zinc-400'}`}
                                >
                                    {badge}
                                </span>
                            </div>
                            <div className="space-y-5 p-5 sm:p-6">
                                {requests.map((r) => (
                                    <div
                                        key={r.id}
                                        className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-5"
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                                            Prośba o przypisanie profilu
                                        </p>
                                        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <Link
                                                    className="font-brook text-3xl hover:text-cyan-300"
                                                    href={`/dramaafera/gracz/${r.playerId}`}
                                                >
                                                    {r.name} →
                                                </Link>
                                                <p className="mt-1 text-sm text-zinc-500">
                                                    Otwórz profil i porównaj historię gier przed
                                                    podjęciem decyzji.
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    className={`${button} bg-emerald-400 text-zinc-950 hover:bg-emerald-300`}
                                                    disabled={busy}
                                                    onClick={() =>
                                                        openDecision(account, 'approve', r)
                                                    }
                                                >
                                                    Zatwierdź
                                                </button>
                                                <button
                                                    className={`${button} border border-rose-400/25 text-rose-300 hover:bg-rose-400/10`}
                                                    disabled={busy}
                                                    onClick={() =>
                                                        openDecision(account, 'reject', r)
                                                    }
                                                >
                                                    Odrzuć
                                                </button>
                                            </div>
                                        </div>
                                        <details className="mt-4 border-t border-amber-400/10 pt-3">
                                            <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-300">
                                                Dane do porównania z zapisami organizatora
                                            </summary>
                                            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                                                <div>
                                                    <dt className="text-zinc-500">Numer profilu</dt>
                                                    <dd className="mt-1 font-mono text-zinc-300">
                                                        {r.playerId}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-zinc-500">Kod znajomego</dt>
                                                    <dd className="mt-1 font-mono text-zinc-300">
                                                        {r.friendCode ?? 'Brak danych'}
                                                    </dd>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <dt className="text-zinc-500">
                                                        Identyfikator gracza z moda
                                                    </dt>
                                                    <dd className="mt-1 font-mono text-zinc-300">
                                                        {r.hashedProductUserId ?? 'Brak danych'}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </details>
                                    </div>
                                ))}
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        className={secondary}
                                        disabled={busy}
                                        onClick={() => openDecision(account, 'correct')}
                                    >
                                        {account.playerId
                                            ? 'Zmień lub odłącz profil'
                                            : 'Przypisz profil ręcznie'}
                                    </button>
                                    {!!account.retryBlocked && (
                                        <button
                                            className={`${button} border border-cyan-400/25 text-cyan-300 hover:bg-cyan-400/10`}
                                            disabled={busy}
                                            onClick={() => openDecision(account, 'retry')}
                                        >
                                            Zezwól na ponowienie prośby
                                        </button>
                                    )}
                                    <button
                                        className={`${button} ${account.isHost ? 'border border-rose-400/25 text-rose-300 hover:bg-rose-400/10' : 'border border-indigo-400/25 text-indigo-300 hover:bg-indigo-400/10'}`}
                                        disabled={busy}
                                        onClick={() =>
                                            openDecision(
                                                account,
                                                account.isHost ? 'revokeHost' : 'grantHost',
                                            )
                                        }
                                    >
                                        {account.isHost
                                            ? 'Odbierz uprawnienia hosta'
                                            : 'Nadaj uprawnienia hosta'}
                                    </button>
                                </div>
                                <AuditHistory
                                    key={`${account.id}-${account.version}`}
                                    accountId={account.id}
                                    initial={data.audits.filter((a) => a.accountId === account.id)}
                                />
                                <details className="text-xs text-zinc-500">
                                    <summary className="cursor-pointer hover:text-zinc-300">
                                        Identyfikator konta Discord
                                    </summary>
                                    <p className="mt-2 break-all font-mono">
                                        {account.discordUserId}
                                    </p>
                                </details>
                            </div>
                        </article>
                    );
                })
            )}
            <div className="flex flex-wrap justify-end gap-3">
                {cursor > 0 && (
                    <button
                        className={secondary}
                        disabled={busy}
                        onClick={() => void load(0).catch((e) => setMessage(e.message))}
                    >
                        Pierwsza strona
                    </button>
                )}
                {data?.nextCursor != null && (
                    <button
                        className={secondary}
                        disabled={busy}
                        onClick={() =>
                            void load(data.nextCursor!).catch((e) => setMessage(e.message))
                        }
                    >
                        Kolejna strona →
                    </button>
                )}
            </div>
            <details className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-500">
                <summary className="cursor-pointer">Jak zapisywane są decyzje?</summary>
                <p className="mt-3 leading-relaxed">
                    Decyzje zapisujemy z uzasadnieniem i loginem hosta. Wspólny login nie rozróżnia
                    osób korzystających z niego. Uprawnienia hosta są nadawane indywidualnie kontom
                    Discord. Samo logowanie nie daje dostępu do narzędzi.
                </p>
            </details>
            {decision && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
                    onKeyDown={(e) => {
                        if (e.key === 'Escape' && !busy) closeDecision();
                        if (e.key === 'Tab') {
                            const fields = dialogRef.current?.querySelectorAll<HTMLElement>(
                                'input:not(:disabled), textarea:not(:disabled), button:not(:disabled)',
                            );
                            if (!fields?.length) {
                                e.preventDefault();
                                return;
                            }
                            const first = fields[0],
                                last = fields[fields.length - 1];
                            if (e.shiftKey && document.activeElement === first) {
                                e.preventDefault();
                                last.focus();
                            } else if (!e.shiftKey && document.activeElement === last) {
                                e.preventDefault();
                                first.focus();
                            }
                        }
                    }}
                >
                    <form
                        role="dialog"
                        ref={dialogRef}
                        aria-modal="true"
                        aria-labelledby="decision-title"
                        className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl sm:p-8"
                        onSubmit={(e) => {
                            e.preventDefault();
                            void decide();
                        }}
                    >
                        <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                            Konto: {decision.account.username}
                        </p>
                        <h3 id="decision-title" className="font-brook text-3xl">
                            {decision.action === 'grantHost'
                                ? 'Nadaj uprawnienia hosta'
                                : decision.action === 'revokeHost'
                                  ? 'Odbierz uprawnienia hosta'
                                  : decision.action === 'approve'
                                    ? 'Zatwierdź przypisanie'
                                    : decision.action === 'reject'
                                      ? 'Odrzuć prośbę'
                                      : decision.action === 'retry'
                                        ? 'Zezwól na ponowienie'
                                        : 'Zmień powiązanie profilu'}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                            {decision.action === 'grantHost'
                                ? 'Ta osoba uzyska dostęp do wszystkich narzędzi hosta, w tym zarządzania kontami i uprawnieniami innych osób.'
                                : decision.action === 'revokeHost'
                                  ? 'Dostęp tej osoby do narzędzi hosta zostanie odebrany od razu. Jej konto i profil pozostaną bez zmian.'
                                  : decision.action === 'approve'
                                    ? `Profil „${decision.request?.name}” zostanie przypisany do tego konta.`
                                    : decision.action === 'reject'
                                      ? 'Gracz nie będzie mógł wysłać kolejnej prośby, dopóki host nie udzieli zgody na ponowienie.'
                                      : decision.action === 'retry'
                                        ? 'Gracz będzie mógł ponownie wybrać profil i wysłać prośbę. Ta decyzja nie przypisuje profilu.'
                                        : 'Wyniki i historia gier pozostaną bez zmian. Wybierz nowy profil lub odłącz obecny.'}
                        </p>
                        {['grantHost', 'revokeHost'].includes(decision.action) && (
                            <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
                                <label
                                    htmlFor="confirm-host-nick"
                                    className="mb-2 block text-sm text-zinc-300"
                                >
                                    Aby potwierdzić, przepisz nick:{' '}
                                    <strong className="select-none text-amber-300">
                                        {decision.account.username}
                                    </strong>
                                </label>
                                <input
                                    id="confirm-host-nick"
                                    autoComplete="off"
                                    required
                                    disabled={busy}
                                    value={confirmationNickname}
                                    onChange={(e) => setConfirmationNickname(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950/50 px-4 py-3 outline-none focus:border-cyan-400"
                                />
                            </div>
                        )}
                        {decision.action === 'correct' && (
                            <div className="mt-5">
                                <label
                                    htmlFor="target-player"
                                    className="mb-2 block text-sm text-zinc-300"
                                >
                                    Numer nowego profilu gracza
                                </label>
                                <input
                                    id="target-player"
                                    type="number"
                                    min={1}
                                    disabled={busy}
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950/50 px-4 py-3 outline-none focus:border-cyan-400"
                                />
                                <p className="mt-2 text-xs text-zinc-500">
                                    Numer znajdziesz w adresie profilu /gracz/… . Puste pole odłącza
                                    obecny profil.
                                </p>
                            </div>
                        )}
                        <label
                            htmlFor="decision-reason"
                            className="mb-2 mt-5 block text-sm text-zinc-300"
                        >
                            Uzasadnienie decyzji
                        </label>
                        <textarea
                            autoFocus
                            id="decision-reason"
                            required
                            minLength={3}
                            maxLength={1000}
                            rows={3}
                            disabled={busy}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Np. profil potwierdzony na podstawie historii gier…"
                            className="w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950/50 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                        />
                        <p className="mt-2 text-xs text-zinc-500">
                            Uzasadnienie trafi do historii decyzji. Nie wpisuj danych osobowych.
                        </p>
                        {formError && (
                            <p
                                role="alert"
                                className="mt-4 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-300"
                            >
                                {formError}
                            </p>
                        )}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={busy}
                                className={secondary}
                                onClick={closeDecision}
                            >
                                Anuluj
                            </button>
                            <button
                                type="submit"
                                disabled={busy}
                                className={`${button} ${decision.action === 'reject' ? 'bg-rose-400 hover:bg-rose-300' : 'bg-cyan-400 hover:bg-cyan-300'} text-zinc-950`}
                            >
                                {busy
                                    ? 'Zapisywanie…'
                                    : decision.action === 'grantHost'
                                      ? 'Nadaj uprawnienia hosta'
                                      : decision.action === 'revokeHost'
                                        ? 'Odbierz uprawnienia hosta'
                                        : decision.action === 'approve'
                                          ? 'Zatwierdź profil'
                                          : decision.action === 'reject'
                                            ? 'Odrzuć prośbę'
                                            : decision.action === 'retry'
                                              ? 'Udziel zgody'
                                              : 'Zapisz zmianę'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}

const actionLabels: Record<string, string> = {
    grantHost: 'Nadanie uprawnień hosta',
    revokeHost: 'Odebranie uprawnień hosta',
    approve: 'Zatwierdzenie',
    reject: 'Odrzucenie',
    retry: 'Zgoda na ponowienie',
    correct: 'Korekta powiązania',
};
function AuditHistory({ accountId, initial }: { accountId: number; initial: Audit[] }) {
    const [audits, setAudits] = useState(initial),
        [hasMore, setHasMore] = useState(true),
        [busy, setBusy] = useState(false),
        [message, setMessage] = useState('');
    async function more() {
        setBusy(true);
        setMessage('');
        try {
            const before = audits.length
                ? Math.min(...audits.map((a) => a.id))
                : Number.MAX_SAFE_INTEGER;
            const response = await fetch(
                `/dramaafera/host/konta?auditAccount=${accountId}&before=${before}`,
                { cache: 'no-store' },
            );
            const result = (await response.json()) as {
                error?: string;
                data: { audits: Audit[]; hasMore: boolean };
            };
            if (!response.ok) throw new Error(result.error ?? 'Nie udało się pobrać historii.');
            setAudits((previous) => [...previous, ...result.data.audits]);
            setHasMore(result.data.hasMore);
        } catch (e) {
            setMessage(e instanceof Error ? e.message : 'Nie udało się pobrać historii.');
        } finally {
            setBusy(false);
        }
    }
    return (
        <details className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-4">
            <summary className="cursor-pointer text-sm font-medium text-zinc-400 hover:text-zinc-200">
                Historia decyzji
            </summary>
            {audits.map((a) => (
                <p
                    key={a.id}
                    className="mt-3 rounded-lg border-l-2 border-zinc-700 pl-3 text-sm leading-relaxed text-zinc-400"
                >
                    {a.createdAt}: {a.actor} · {actionLabels[a.action] ?? a.action} ·{' '}
                    {a.previousPlayerId ?? 'brak'} → {a.newPlayerId ?? 'brak'} · {a.reason}
                </p>
            ))}
            {hasMore && (
                <button
                    className="mt-4 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                    disabled={busy}
                    onClick={() => void more()}
                >
                    Pokaż starsze decyzje
                </button>
            )}
            <p role="status">{message}</p>
        </details>
    );
}
