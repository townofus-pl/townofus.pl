'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import type { RolePerformance } from './_getRoleTopPerformances';

export default function RoleTopPerformances({ performances, seasonId }: { performances: RolePerformance[]; seasonId: number }) {
    const [visible, setVisible] = useState(3);
    return <div className="space-y-4">
        {performances.slice(0, visible).map((performance, index) => {
            const medal = index === 0 ? 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50' : index === 1 ? 'from-gray-400/20 to-gray-500/20 border-gray-400/50' : index === 2 ? 'from-orange-600/20 to-orange-700/20 border-orange-600/50' : 'from-zinc-800/20 to-zinc-900/20 border-zinc-700/50';
            return <Link key={`${performance.gameId}-${performance.playerName}`} href={buildSeasonUrl(`/historia-gier/${performance.date}/${performance.gameId}`, seasonId)} className="block">
                <div className={`bg-gradient-to-r ${medal} rounded-xl border p-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer`}>
                <div className="flex items-center gap-4">
                    <div className="w-14 text-center text-4xl font-bold tabular-nums flex-shrink-0 mx-0.5">{index + 1}</div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-white">{new Date(performance.startTime).toLocaleDateString('pl-PL', { timeZone: 'UTC' })}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="font-semibold text-orange-300">{performance.playerName}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                            <div className="flex items-center gap-1">
                                <span className={performance.win ? 'text-green-400' : 'text-red-400'}>{performance.win ? '✓ Wygrana' : '✗ Przegrana'}</span>
                            </div>
                                <span className="text-gray-500">•</span>
                                <span>{performance.map}</span>
                                <span className="text-gray-500">•</span>
                                <span>{performance.duration}</span>
                        </div>
                    </div>
                    <div className="text-gray-400 flex-shrink-0">→</div>
                </div>
                </div>
            </Link>;
        })}
        {performances.length > 0 && <div className="mt-4 text-center text-sm text-gray-400">Kliknij aby zobaczyć szczegóły gry</div>}
        {visible < performances.length && <button type="button" onClick={() => setVisible(current => current + 10)} className="w-full rounded-lg bg-zinc-800 px-4 py-3 font-semibold text-zinc-200 transition-colors hover:bg-zinc-700">Wczytaj więcej</button>}
        {performances.length === 0 && <p className="py-8 text-center text-gray-400">Brak występów w tym sezonie.</p>}
    </div>;
}
