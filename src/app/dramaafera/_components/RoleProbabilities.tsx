'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Teams } from '@/constants/teams';
import { convertRoleToUrlSlug, getRoleIconPath } from '../_utils/gameUtils';
import { buildSeasonUrl } from '../_utils/seasonHelpers';
import { getWinRatioColor } from '../_utils/winRatioColor';
import type { RoleProbabilityData } from '../_utils/roleProbabilities';
import { hasCompleteFactionSample, ROLE_PROBABILITY_K } from '../_utils/roleProbabilities';
import RoleProbabilityConfig from './RoleProbabilityConfig';

const TEAM_LABELS = { [Teams.Crewmate]: 'Załoga', [Teams.Impostor]: 'Impostorzy', [Teams.Neutral]: 'Neutralni' };
const numberFormat = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 });
const percent = (value: number) => `${numberFormat.format(value * 100)}%`;
type SortKey = 'games' | 'wins' | 'losses' | 'winRate' | 'weight' | 'change';
const COLUMNS: { key: SortKey; label: string }[] = [
    { key: 'games', label: 'Rozgrywki' },
    { key: 'wins', label: 'Wygrane' },
    { key: 'losses', label: 'Porażki' },
    { key: 'winRate', label: 'W/R' },
    { key: 'weight', label: 'Waga losowania' },
    { key: 'change', label: 'Zmiana' },
];

interface RoleProbabilitiesProps {
    data: RoleProbabilityData;
    seasonId: number;
}

export default function RoleProbabilities({ data, seasonId }: RoleProbabilitiesProps) {
    const completeFactionSample = hasCompleteFactionSample(data);
    const [search, setSearch] = useState('');
    const [team, setTeam] = useState('');
    const [sortBy, setSortBy] = useState<SortKey>('weight');
    const [ascending, setAscending] = useState(false);
    const sortedRoles = useMemo(() => data.roles
        .map(role => ({ ...role, losses: role.games - role.wins, change: role.weight - 0.5 }))
        .filter(role => (!team || role.team === team) && role.name.toLocaleLowerCase('pl').includes(search.trim().toLocaleLowerCase('pl')))
        .sort((a, b) => {
            if (sortBy === 'winRate') {
                const missing = Number(a.winRate === null) - Number(b.winRate === null);
                if (missing) return missing;
            }
            return (ascending ? (a[sortBy] ?? 0) - (b[sortBy] ?? 0) : (b[sortBy] ?? 0) - (a[sortBy] ?? 0)) || a.name.localeCompare(b.name, 'pl');
        }), [data.roles, team, search, sortBy, ascending]);
    const inputClass = 'w-full rounded-lg border border-gray-600 bg-zinc-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <div className="container mx-auto min-h-screen rounded-xl bg-zinc-900/50 px-4 py-8 font-barlow text-white">
            <div className="mx-auto mb-8 max-w-7xl text-center">
                <h1 className="font-brook text-4xl font-bold">Prawdopodobieństwo wystąpień</h1>
                <p className="mt-2 text-gray-400">Sezon {seasonId} · Ostatnie 20 gier frakcji · Ostatnie 20 gier każdej roli (minimum 10)</p>
            </div>

            <div className="mx-auto max-w-7xl rounded-xl bg-zinc-900/80 p-4 md:p-8">
                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    {data.factions.map(faction => <div key={faction.team} className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-4">
                        <h2 className="font-brook text-xl font-bold text-yellow-400">{TEAM_LABELS[faction.team]}</h2>
                        <p className="mt-2 text-2xl font-bold" style={{ color: getWinRatioColor(faction.winRate * 100) }}>{percent(faction.winRate)}</p>
                        <p className="mt-1 text-sm text-gray-400">Wygrane: <span className="font-bold text-green-400">{faction.wins}</span>/{data.games} · Cel: {percent(faction.target)}</p>
                    </div>)}
                </div>

                {!completeFactionSample && <p className="mb-6 rounded-lg border border-yellow-700/50 bg-yellow-900/20 p-4 text-yellow-300" role="status">
                    {data.games < 20 ? `Zebrano ${data.games}/20 gier. Do zebrania pełnej próby wagi pozostają na poziomie 50%.` : `Nie ustalono zwycięzcy w ${data.unknownWins} grach. Wagi pozostają na poziomie 50%.`}
                </p>}

                <RoleProbabilityConfig roles={data.roles} seasonId={seasonId} completeFactionSample={completeFactionSample} />

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
                <p className="mb-4 text-sm text-gray-400">Liczba ról: {sortedRoles.length}. Kliknij nazwę roli, aby zobaczyć wyniki graczy. Waga bazowa wynosi 50% i nie oznacza szansy pojawienia się roli w pojedynczej grze.</p>
                <p className="mb-4 text-sm text-gray-400">Role z mniej niż 10 grami zachowują wagę 50%. Jeśli rolę miało kilku graczy, mecz liczy się raz i jest wygrany, gdy wygrał co najmniej jeden z nich. Zwycięstwa zakochanych zaliczamy do neutrali.</p>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] border border-zinc-700 bg-zinc-800/80 text-sm md:text-base">
                        <caption className="sr-only">Wagi losowania ról — sezon {seasonId}</caption>
                        <thead className="bg-zinc-900/80 text-yellow-400"><tr>
                            <th scope="col" className="p-3">#</th>
                            <th scope="col" className="p-3 text-left">Rola</th>
                            {COLUMNS.map(column => <th key={column.key} scope="col" className="whitespace-nowrap p-3" aria-sort={sortBy === column.key ? ascending ? 'ascending' : 'descending' : 'none'}>
                                <button className="hover:text-yellow-200" onClick={() => { setSortBy(column.key); setAscending(sortBy === column.key ? !ascending : false); }}>
                                    {column.label} {sortBy === column.key && (ascending ? '▲' : '▼')}
                                </button>
                            </th>)}
                        </tr></thead>
                        <tbody>
                            {sortedRoles.map((role, index) => <tr key={role.name} className="border-b border-zinc-700 hover:bg-zinc-700/30">
                                <td className="px-2 py-1 text-center font-bold text-yellow-300">{index + 1}</td>
                                <td className="px-2 py-1">
                                    <div className="flex items-center gap-2">
                                        <Image src={getRoleIconPath(role.name, seasonId)} alt="" width={32} height={32} className="h-8 w-8 shrink-0 object-contain" />
                                        <Link href={buildSeasonUrl(`/role/${convertRoleToUrlSlug(role.name)}`, seasonId)} className="font-barlow font-bold transition-colors hover:underline" style={{ color: role.color }}>{role.name}</Link>
                                    </div>
                                </td>
                                <td className="px-2 py-1 text-center" title={role.games < 10 ? 'Niepełna próba — waga bazowa 50%' : undefined}>{role.games}</td>
                                <td className="px-2 py-1 text-center font-bold text-green-400">{role.wins}</td>
                                <td className="px-2 py-1 text-center font-bold text-red-400">{role.losses}</td>
                                <td className="px-2 py-1 text-center font-bold" style={role.winRate === null ? undefined : { color: getWinRatioColor(role.winRate * 100) }}>{role.winRate === null ? '—' : percent(role.winRate)}</td>
                                <td className="px-2 py-1 text-center font-bold text-yellow-300">{percent(role.weight)}</td>
                                <td className={`whitespace-nowrap px-2 py-1 text-center font-bold ${role.change > 0 ? 'text-green-400' : role.change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                    {role.change > 0 ? '+' : ''}{numberFormat.format(role.change * 100)} p.p.
                                </td>
                            </tr>)}
                            {sortedRoles.length === 0 && <tr><td colSpan={COLUMNS.length + 2} className="p-12 text-center text-gray-400">{data.roles.length ? 'Brak ról pasujących do filtrów.' : 'Brak wyników ról w wybranym okresie.'}</td></tr>}
                        </tbody>
                    </table>
                </div>

                <details className="mt-6 text-sm text-gray-400">
                    <summary className="cursor-pointer text-gray-300 hover:text-white">Jak obliczamy wagę?</summary>
                    <p className="mt-2">Waga = 50% − {ROLE_PROBABILITY_K} × (winratio frakcji − cel) × (winratio roli − winratio frakcji). W obliczeniach procenty są ułamkami, a współczynnik korekty K = {ROLE_PROBABILITY_K}. Każde przeliczenie zaczyna się od bazowych 50% — korekty nie kumulują się.</p>
                </details>
            </div>
        </div>
    );
}
