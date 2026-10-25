'use client';

import { useState } from 'react';
import CollapsibleSection from '@/app/dramaafera/_components/CollapsibleSection';
import PlayerStatsBreakdown from '@/app/_components/PlayerStatsBreakdown';
import { buildRoleActionStats, type RoleStatsGame } from '@/app/dramaafera/_utils/roleActionStats';
import { getRoleStatActionsAction } from '@/app/dramaafera/_actions/roleStatsActions';

export default function RoleDetailedStats({ games, roleName, seasonId }: { games: RoleStatsGame[]; roleName: string; seasonId: number }) {
    const [stats, setStats] = useState<ReturnType<typeof buildRoleActionStats> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    async function load() {
        if (stats || loading) return;
        setLoading(true);
        setError(false);
        try {
            const actions = await getRoleStatActionsAction(roleName, seasonId);
            setStats(buildRoleActionStats(games, actions, roleName, seasonId));
        } catch { setError(true); }
        finally { setLoading(false); }
    }
    return <CollapsibleSection title="Szczegółowe statystyki" defaultOpen={false} icon="📊" onOpen={() => void load()}>
        {loading && <p role="status" className="py-8 text-center text-gray-400">Ładowanie statystyk…</p>}
        {error && <div role="alert" className="py-4 text-center text-red-300">Nie udało się pobrać statystyk. <button type="button" onClick={() => void load()} className="underline">Spróbuj ponownie</button></div>}
        {stats && <>
            <p className="mb-4 text-center text-sm text-zinc-400">Statystyki obejmują tylko działania wykonane podczas gry tą rolą, również po otrzymaniu jej w trakcie rozgrywki.</p>
            {stats.skippedLegacyGames > 0 && <p className="mb-4 text-center text-sm text-zinc-400">Pominięto starsze gry ze zmianą roli: {stats.skippedLegacyGames}. Nie zawierają danych pozwalających rozdzielić działania między role.</p>}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {stats.totalTasks > 0 && <div className="rounded-lg bg-zinc-800/30 p-4 text-center">
                    <div className="text-xl font-bold text-pink-400">{stats.maxTasks > 0 ? `${stats.totalTasks}/${stats.maxTasks}` : stats.totalTasks}</div>
                    <div className="text-sm text-zinc-400">Wykonanych tasków</div>
                </div>}
                <div className="rounded-lg bg-zinc-800/30 p-4 text-center">
                    <div className="text-xl font-bold text-cyan-400">{stats.survivedRounds}/{stats.totalRounds}</div>
                    <div className="text-sm text-zinc-400">Przeżytych rund</div>
                    {stats.totalRounds > 0 && <div className="mt-1 text-xs text-zinc-500">{Math.round(stats.survivedRounds / stats.totalRounds * 100)}% przeżywalności</div>}
                </div>
            </div>
            <PlayerStatsBreakdown breakdown={stats.byPlayer} seasonId={seasonId} hideZeroStats={true} rows="player" variant="wide" layout="stacked" />
        </>}
    </CollapsibleSection>;
}
