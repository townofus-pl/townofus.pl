'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { RoleRankingSummary } from '@/app/dramaafera/_services';
import { getRoleRankingsByDateRange, getRoleRankingsByAppearanceCount } from '@/app/dramaafera/_actions/roleRankingActions';
import { convertRoleToUrlSlug, getRoleIconPath } from '@/app/dramaafera/_utils/gameUtils';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import { getWinRatioColor } from '@/app/dramaafera/_utils/winRatioColor';
import { getRoleAssessment } from '@/app/dramaafera/_utils/roleStrength';

type SortKey = 'totalPoints' | 'gamesPlayed' | 'wins' | 'winRate' | 'averagePoints' | 'strength' | 'losses' | 'assessmentOrder';
const COLUMNS: { key: SortKey; label: string }[] = [
    { key: 'gamesPlayed', label: 'Rozgrywki' },
    { key: 'wins', label: 'Wygrane' },
    { key: 'losses', label: 'Porażki' },
    { key: 'winRate', label: 'W/R' },
    { key: 'totalPoints', label: 'Suma DAP' },
    { key: 'averagePoints', label: 'Średnia DAP' },
    { key: 'strength', label: 'Siła roli' },
    { key: 'assessmentOrder', label: 'Ocena' },
];
const ASSESSMENT_ORDER: Record<string, number> = { 'do nerfa': 5, 'do buffa': 4, 'mocna': 3, 'słabsza': 2, 'zbalansowana': 1 };
const TEAM_LABELS: Record<string, string> = { Crewmate: 'Załoga', Impostor: 'Impostorzy', Neutral: 'Neutralni' };
const numberFormat = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 });

interface RoleRankingTableProps {
    roles: RoleRankingSummary[];
    seasonId: number;
    excludeLatestDay?: boolean;
    showBalance?: boolean;
}

export default function RoleRankingTable({ roles: initialRoles, seasonId, excludeLatestDay = true, showBalance = false }: RoleRankingTableProps) {
    const columns = COLUMNS.filter(column => showBalance || (column.key !== 'strength' && column.key !== 'assessmentOrder'));
    const [roles, setRoles] = useState(initialRoles);
    const [sortBy, setSortBy] = useState<SortKey>('totalPoints');
    const [ascending, setAscending] = useState(false);
    const [filterMode, setFilterMode] = useState<'dates' | 'appearances'>('dates');
    const [appearanceCount, setAppearanceCount] = useState('10');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [appliedRange, setAppliedRange] = useState('Cały sezon');
    const [search, setSearch] = useState('');
    const [team, setTeam] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const invalidCount = !/^\d+$/.test(appearanceCount) || Number(appearanceCount) < 1 || Number(appearanceCount) > 10000;
    const invalidRange = filterMode === 'dates' && Boolean(dateFrom && dateTo && dateFrom > dateTo);

    const sortedRoles = useMemo(() => roles
        .map(role => {
            const assessment = getRoleAssessment(role.strength, role.strengthGames);
            return { ...role, losses: role.gamesPlayed - role.wins, assessment,
                assessmentOrder: ASSESSMENT_ORDER[assessment.label] ?? 0 };
        })
        .filter(role => (!team || role.team === team) && role.displayName.toLocaleLowerCase('pl').includes(search.trim().toLocaleLowerCase('pl')))
        .sort((a, b) => {
            // Missing DAP belongs below measured values, including negative scores.
            if (sortBy === 'totalPoints' || sortBy === 'averagePoints') {
                const missing = Number(a.dapGames === 0) - Number(b.dapGames === 0);
                if (missing) return missing;
            }
            if (sortBy === 'assessmentOrder') {
                const missing = Number(a.assessmentOrder === 0) - Number(b.assessmentOrder === 0);
                if (missing) return missing;
            }
            if (sortBy === 'strength') {
                const missing = Number(a[sortBy] === null) - Number(b[sortBy] === null);
                if (missing) return missing;
            }
            return (ascending ? (a[sortBy] ?? 0) - (b[sortBy] ?? 0) : (b[sortBy] ?? 0) - (a[sortBy] ?? 0)) || a.displayName.localeCompare(b.displayName, 'pl');
        }),
    [roles, team, search, sortBy, ascending]);

    async function loadRange(reset = false) {
        if (isLoading || (!reset && (invalidRange || (filterMode === 'appearances' && invalidCount)))) return;
        setIsLoading(true);
        setError('');
        try {
            const byCount = !reset && filterMode === 'appearances';
            const data = byCount
                ? await getRoleRankingsByAppearanceCount(seasonId, Number(appearanceCount), excludeLatestDay)
                : await getRoleRankingsByDateRange(seasonId, reset ? undefined : dateFrom || undefined, reset ? undefined : dateTo || undefined, excludeLatestDay);
            setRoles(data);
            setAppliedRange(byCount ? `Ostatnie ${Number(appearanceCount)} występów każdej roli` : reset || (!dateFrom && !dateTo) ? 'Cały sezon' : `${dateFrom || 'Początek sezonu'} — ${dateTo || 'Koniec sezonu'}`);
            if (reset) { setDateFrom(''); setDateTo(''); setFilterMode('dates'); }
        } catch {
            setError('Nie udało się pobrać wyników ról. Spróbuj ponownie.');
        } finally {
            setIsLoading(false);
        }
    }

    const inputClass = 'w-full rounded-lg border border-gray-600 bg-zinc-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50';

    return (
        <div className="container mx-auto min-h-screen rounded-xl bg-zinc-900/50 px-4 py-8 font-barlow text-white">
            <div className="mx-auto mb-8 max-w-7xl text-center">
                <h1 className="font-brook text-4xl font-bold">Wyniki ról</h1>
                <p className="mt-2 text-gray-400">Sezon {seasonId} · {appliedRange}</p>
            </div>

            <div className="mx-auto max-w-7xl rounded-xl bg-zinc-900/80 p-4 md:p-8">
                <form className="mb-6 flex flex-wrap items-end gap-4" onSubmit={event => { event.preventDefault(); void loadRange(); }}>
                    <label className="min-w-48 text-sm text-gray-300">Zakres danych
                        <select value={filterMode} disabled={isLoading} onChange={event => setFilterMode(event.target.value as 'dates' | 'appearances')} className={`${inputClass} mt-2`}>
                            <option value="dates">Zakres dat</option>
                            <option value="appearances">Ostatnie występy każdej roli</option>
                        </select>
                    </label>
                    {filterMode === 'dates' ? <>
                    <label className="min-w-36 flex-1 text-sm text-gray-300">Od dnia
                        <input type="date" value={dateFrom} max={dateTo || undefined} disabled={isLoading} onChange={event => setDateFrom(event.target.value)} className={`${inputClass} mt-2`} />
                    </label>
                    <label className="min-w-36 flex-1 text-sm text-gray-300">Do dnia
                        <input type="date" value={dateTo} min={dateFrom || undefined} disabled={isLoading} onChange={event => setDateTo(event.target.value)} className={`${inputClass} mt-2`} />
                    </label>
                    </> : <label className="min-w-36 flex-1 text-sm text-gray-300">Liczba występów na rolę
                        <input type="number" min="1" max="10000" step="1" required value={appearanceCount} disabled={isLoading} onChange={event => setAppearanceCount(event.target.value)} className={`${inputClass} mt-2`} />
                    </label>}
                    <button disabled={isLoading || invalidRange || (filterMode === 'appearances' && invalidCount)} className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{isLoading ? 'Ładowanie…' : 'Pokaż wyniki'}</button>
                    <button type="button" disabled={isLoading} onClick={() => void loadRange(true)} className="rounded-lg bg-zinc-700 px-4 py-2 hover:bg-zinc-600 disabled:opacity-50">Cały sezon</button>
                </form>
                {filterMode === 'appearances' && invalidCount && <p role="alert" className="mb-4 text-red-300">Podaj całkowitą liczbę występów od 1 do 10000.</p>}
                {invalidRange && <p role="alert" className="mb-4 text-red-300">Data końcowa nie może być wcześniejsza niż początkowa.</p>}
                {error && <p role="alert" className="mb-4 rounded-lg border border-red-700/50 bg-red-900/30 p-4 text-red-300">{error}</p>}

                <div className="mb-4 flex flex-wrap items-end gap-4">
                    <label className="min-w-48 flex-1 text-sm text-gray-300">Szukaj roli
                        <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nazwa roli…" className={`${inputClass} mt-2`} />
                    </label>
                    <label className="min-w-40 text-sm text-gray-300">Drużyna
                        <select value={team} onChange={event => setTeam(event.target.value)} className={`${inputClass} mt-2`}>
                            <option value="">Wszystkie drużyny</option>
                            {Object.entries(TEAM_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                    </label>
                </div>
                <p className="mb-4 text-sm text-gray-400">Liczba ról: {sortedRoles.length}. Kliknij nazwę roli, aby zobaczyć wyniki graczy. Rozgrywki oznaczają występy graczy z daną rolą początkową.</p>
                <p className="mb-4 text-sm text-gray-400">{excludeLatestDay ? 'Suma i średnia DAP pomijają najnowszy dzień z grami w sezonie, tak jak w rankingu graczy. Aktualizują się po rozpoczęciu kolejnej sesji.' : 'Suma i średnia DAP obejmują wszystkie dni wybranego okresu, także najnowszą sesję.'} Średnia obejmuje tylko rozgrywki uwzględnione w DAP. „—” oznacza brak takich rozgrywek w wybranym okresie. Liczba rozgrywek i wygranych obejmuje cały wybrany okres.</p>
                <p className="mb-4 text-sm text-gray-400">W trybie liczby występów każda rola ma własne ostatnie N występów w sezonie (lub mniej, jeśli brakuje danych). Wszystkie statystyki dotyczą tej próby. Na publicznej stronie wybieramy występy sprzed najnowszego dnia z grami; panel hosta uwzględnia także ten dzień.</p>

                <div className="overflow-x-auto" aria-busy={isLoading}>
                    <table className={`w-full min-w-[780px] border border-zinc-700 bg-zinc-800/80 text-sm md:text-base ${isLoading ? 'opacity-50' : ''}`}>
                        <caption className="sr-only">Wyniki ról — sezon {seasonId}, {appliedRange}</caption>
                        <thead className="bg-zinc-900/80 text-yellow-400">
                            <tr>
                                <th scope="col" className="p-3">#</th>
                                <th scope="col" className="p-3 text-left">Rola</th>
                                {columns.map(column => <th key={column.key} scope="col" className="p-3 whitespace-nowrap" aria-sort={sortBy === column.key ? ascending ? 'ascending' : 'descending' : 'none'}>
                                    <button className="hover:text-yellow-200" onClick={() => { setSortBy(column.key); setAscending(sortBy === column.key ? !ascending : false); }}>
                                        {column.label} {sortBy === column.key && (ascending ? '▲' : '▼')}
                                    </button>
                                </th>)}

                            </tr>
                        </thead>
                        <tbody>
                            {sortedRoles.map((role, index) =>
                                <tr key={role.name} className="border-b border-zinc-700 hover:bg-zinc-700/30">
                                    <td className="px-2 py-1 text-center font-bold text-yellow-300">{index + 1}</td>
                                    <td className="px-2 py-1">
                                        <div className="flex items-center gap-2">
                                            <Image src={getRoleIconPath(role.name, seasonId)} alt="" width={32} height={32} className="h-8 w-8 shrink-0 object-contain" />
                                            <Link href={buildSeasonUrl(`/role/${convertRoleToUrlSlug(role.name)}`, seasonId)} className="font-barlow font-bold hover:underline transition-colors" style={{ color: role.color }}>{role.displayName}</Link>
                                        </div>
                                    </td>
                                    <td className="px-2 py-1 text-center">{role.gamesPlayed}</td>
                                    <td className="px-2 py-1 text-center font-bold text-green-400">{role.wins}</td>
                                    <td className="px-2 py-1 text-center font-bold text-red-400">{role.losses}</td>
                                    <td className="px-2 py-1 text-center font-bold" style={{ color: getWinRatioColor(role.winRate) }}>{role.winRate}%</td>
                                    <td className="px-2 py-1 text-center text-blue-400">{role.dapGames > 0 ? numberFormat.format(role.totalPoints) : '—'}</td>
                                    <td className="px-2 py-1 text-center text-cyan-400">{role.dapGames > 0 ? numberFormat.format(role.averagePoints) : '—'}</td>
                                    {showBalance && <>
                                    <td className="px-2 py-2 text-center">
                                        <span className="font-bold text-yellow-300">{role.strength !== null ? numberFormat.format(role.strength) : '—'}</span>
                                    </td>
                                    <td className={`px-2 py-1 text-center font-semibold whitespace-nowrap ${role.assessment.className}`}>{role.assessment.label}</td>
                                    </>}
                                </tr>
                            )}
                            {sortedRoles.length === 0 && <tr><td colSpan={columns.length + 2} className="p-12 text-center text-gray-400">{roles.length ? 'Brak ról pasujących do filtrów.' : 'Brak wyników ról w wybranym okresie.'}</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
