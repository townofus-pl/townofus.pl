'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { getHostRoleRankingsAction, getHostRoleProbabilitiesAction } from '../_actions/hostRoleDataActions';
import RoleBalanceReviews from './RoleBalanceReviews';
import RoleRankingTable from './RoleRankingTable';
import RoleProbabilities from './RoleProbabilities';

type View = 'reviews' | 'stats' | 'probabilities';
const views: Array<{ id: View; label: string }> = [
    { id: 'reviews', label: 'Przeglądy balansu' },
    { id: 'stats', label: 'Statystyki ról' },
    { id: 'probabilities', label: 'Prawdopodobieństwo wystąpień' },
];

function DataPanel<T>({ seasonId, load, children }: {
    seasonId: number; load: (season: number) => Promise<T>; children: (data: T) => ReactNode;
}) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const refresh = useCallback(() => setAttempt(value => value + 1), []);
    useEffect(() => {
        let active = true;
        setLoading(true); setError(false);
        load(seasonId).then(value => { if (active) setData(value); })
            .catch(() => { if (active) setError(true); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [load, seasonId, attempt]);
    return <div>
        <button type="button" disabled={loading} onClick={refresh} className="mb-4 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">Odśwież dane</button>
        {loading && <p role="status" className="mb-4 text-gray-300">Ładowanie danych…</p>}
        {error && <p role="alert" className="mb-4 text-red-300">Nie udało się pobrać danych. Spróbuj odświeżyć.</p>}
        {!loading && data !== null && children(data)}
    </div>;
}

export default function HostRolePanels({ seasonId }: { seasonId: number }) {
    const [view, setView] = useState<View>('reviews');
    const [visited, setVisited] = useState<View[]>(['reviews']);
    return <div>
        <div className="mb-4 flex flex-wrap gap-3" aria-label="Widok ról">
            {views.map(item => <button key={item.id} type="button" aria-pressed={view === item.id}
                onClick={() => { setView(item.id); setVisited(previous => previous.includes(item.id) ? previous : [...previous, item.id]); }}
                className={view === item.id ? 'rounded-lg bg-blue-600 px-4 py-2 text-white' : 'rounded-lg bg-zinc-800 px-4 py-2 text-gray-300'}>{item.label}</button>)}
        </div>
        <div hidden={view !== 'reviews'}><RoleBalanceReviews seasonId={seasonId} /></div>
        {visited.includes('stats') && <div hidden={view !== 'stats'}><DataPanel seasonId={seasonId} load={getHostRoleRankingsAction}>
            {roles => <RoleRankingTable roles={roles} seasonId={seasonId} excludeLatestDay={false} showBalance />}
        </DataPanel></div>}
        {visited.includes('probabilities') && <div hidden={view !== 'probabilities'}><DataPanel seasonId={seasonId} load={getHostRoleProbabilitiesAction}>
            {data => <RoleProbabilities data={data} seasonId={seasonId} />}
        </DataPanel></div>}
    </div>;
}
