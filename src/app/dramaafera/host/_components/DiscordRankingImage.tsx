'use client';

import { useEffect, useRef, useState } from 'react';
import RankingTierTable from '../../_components/PodsumowanieClient/RankingTierTable';
import { getDiscordRankingAction } from '../../_actions/discordMaterialsActions';
import { rankingTablePng } from '../_utils/rankingTablePng';

export default function DiscordRankingImage() {
    const preview = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<Awaited<ReturnType<typeof getDiscordRankingAction>>>();
    const [loadError, setLoadError] = useState(false);
    const [copying, setCopying] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        let active = true;
        getDiscordRankingAction().then(result => {
            if (active) setData(result);
        }).catch(() => {
            if (active) setLoadError(true);
        });
        return () => { active = false; };
    }, []);

    async function copyRanking() {
        const table = preview.current?.querySelector('table');
        if (!table) return;
        setCopying(true);
        setStatus('');
        try {
            if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('Brak obsługi schowka.');
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': rankingTablePng(table) })]);
            setStatus('Skopiowano PNG do schowka.');
        } catch {
            setStatus('Nie udało się skopiować obrazu do schowka.');
        } finally {
            setCopying(false);
        }
    }

    return (
        <section className="mt-6 space-y-4 rounded-xl bg-zinc-900/70 p-4 font-barlow text-white md:p-6">
            <h2 className="font-brook text-3xl">Ranking do wklejenia na Discorda</h2>
            {loadError && <p role="alert" className="text-red-300">Nie udało się wczytać rankingu.</p>}
            {!loadError && !data && <p role="status">Wczytywanie rankingu…</p>}
            {data?.ranking.length === 0 && <p>Brak graczy w rankingu.</p>}
            {data && data.ranking.length > 0 && <>
                {data.baselineDate && <p className="text-gray-300">Kolory punktów pokazują zmianę względem rankingu po sesji z {data.baselineDate}.</p>}
                <div className="overflow-x-auto rounded-lg bg-black p-3" ref={preview}>
                    <div className="mx-auto w-[1400px]">
                        <RankingTierTable isFullscreen={false} rankingAfterSession={data.ranking} weeklyStats={data.weeklyStats} title={data.title} />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button type="button" onClick={() => void copyRanking()} disabled={copying}
                        className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-zinc-950 hover:bg-yellow-400 disabled:opacity-50">
                        {copying ? 'Kopiowanie…' : 'Kopiuj ranking jako PNG'}
                    </button>
                    <span role="status" className="text-gray-300">{status}</span>
                </div>
            </>}
        </section>
    );
}
