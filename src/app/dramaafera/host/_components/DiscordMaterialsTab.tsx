'use client';

import { useEffect, useState } from 'react';
import { getDiscordChangelogAction } from '../../_actions/discordMaterialsActions';
import DiscordRankingImage from './DiscordRankingImage';

export default function DiscordMaterialsTab() {
    const [message, setMessage] = useState('');
    const [loadError, setLoadError] = useState(false);
    const [copyStatus, setCopyStatus] = useState('');

    useEffect(() => {
        let active = true;
        getDiscordChangelogAction().then(text => {
            if (active) setMessage(text);
        }).catch(() => {
            if (active) setLoadError(true);
        });
        return () => { active = false; };
    }, []);

    async function copyMessage() {
        try {
            await navigator.clipboard.writeText(message);
            setCopyStatus('Skopiowano do schowka.');
        } catch {
            setCopyStatus('Nie udało się skopiować. Zaznacz tekst w polu i skopiuj go ręcznie.');
        }
    }

    return (
        <>
            <section className="space-y-4 rounded-xl bg-zinc-900/70 p-4 font-barlow text-white md:p-6">
                <h2 className="font-brook text-3xl">Changelog na Discorda</h2>
                <p className="text-gray-300">Lista ról pochodzi z opublikowanego changeloga. Po wklejeniu tekstu oznacz Emperora.</p>
                {loadError && <p role="alert" className="text-red-300">Nie udało się wczytać tekstu. Otwórz zakładkę ponownie, aby spróbować jeszcze raz.</p>}
                {!loadError && !message && <p role="status">Przygotowywanie tekstu…</p>}
                {message && <>
                    <textarea aria-label="Tekst changeloga do wklejenia na Discorda" readOnly value={message} rows={20}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-4 font-mono text-sm text-white" />
                    <div className="flex flex-wrap items-center gap-3">
                        <button type="button" onClick={() => void copyMessage()}
                            className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-zinc-950 hover:bg-yellow-400">Kopiuj tekst</button>
                        <span role="status" className="text-gray-300">{copyStatus}</span>
                    </div>
                </>}
            </section>
            <DiscordRankingImage />
        </>
    );
}
