'use client';

import { useEffect, useRef, useState } from 'react';
import { MAX_ROLE_CONFIG_BYTES, MIRA_PRESET_PATH, updateRoleProbabilityConfig, type UpdatedRoleConfig } from '../_utils/roleProbabilityConfig';
import type { RoleProbabilityData } from '../_utils/roleProbabilities';

interface PickerWindow extends Window {
    showOpenFilePicker?: (options: {
        id: string;
        multiple: boolean;
        excludeAcceptAllOption: boolean;
        types: Array<{ description: string; accept: Record<string, string[]> }>;
        startIn?: FileSystemFileHandle;
    }) => Promise<FileSystemFileHandle[]>;
}

interface LoadedConfig {
    name: string;
    original: string;
    updated: UpdatedRoleConfig;
    handle?: FileSystemFileHandle;
}

const buttonClass = 'rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryClass = 'rounded-lg bg-zinc-700 px-4 py-2 text-white hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50';

async function readConfig(file: File): Promise<string> {
    if (!/\.cfg$/i.test(file.name)) throw new Error('Wybierz plik z rozszerzeniem .cfg.');
    if (file.size > MAX_ROLE_CONFIG_BYTES) throw new Error('Plik .cfg może mieć maksymalnie 1 MB.');
    try {
        // Keep the optional UTF-8 BOM so saving does not silently remove it.
        return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(await file.arrayBuffer());
    } catch {
        throw new Error('Nie udało się odczytać pliku. Wybierz plik .cfg w kodowaniu UTF-8.');
    }
}

export default function RoleProbabilityConfig({ roles }: { roles: RoleProbabilityData['roles'] }) {
    const [loaded, setLoaded] = useState<LoadedConfig | null>(null);
    const [supportsPicker, setSupportsPicker] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { setSupportsPicker(typeof (window as PickerWindow).showOpenFilePicker === 'function'); }, []);

    async function load(file: File, handle?: FileSystemFileHandle) {
        const original = await readConfig(file);
        const updated = updateRoleProbabilityConfig(original, roles);
        setLoaded({ name: file.name, original, updated, handle });
    }

    async function selectFile(file?: File) {
        if (!file || busy) return;
        setBusy(true); setError(''); setMessage(''); setLoaded(null);
        try { await load(file); }
        catch (cause) { setError(cause instanceof Error ? cause.message : 'Nie udało się odczytać pliku.'); }
        finally { setBusy(false); if (inputRef.current) inputRef.current.value = ''; }
    }

    async function openForWriting() {
        const picker = (window as PickerWindow).showOpenFilePicker;
        if (!picker || busy) return;
        setBusy(true); setError(''); setMessage('');
        try {
            const [handle] = await picker.call(window, {
                id: 'mira-role-probabilities', multiple: false, excludeAcceptAllOption: true,
                types: [{ description: 'Ustawienia TOU-Mira (.cfg)', accept: { 'text/plain': ['.cfg'] } }],
                ...(loaded?.handle ? { startIn: loaded.handle } : {}),
            });
            if (handle) {
                setLoaded(null);
                await load(await handle.getFile(), handle);
            }
        } catch (cause) {
            if (!(cause instanceof DOMException && cause.name === 'AbortError')) {
                setError('Nie udało się otworzyć pliku do zapisu. Skorzystaj z pola wyboru .cfg i pobierz gotowy plik.');
            }
        } finally { setBusy(false); }
    }

    function download() {
        if (!loaded) return;
        const url = URL.createObjectURL(new Blob([loaded.updated.content], { type: 'text/plain;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url; link.download = loaded.name;
        document.body.appendChild(link); link.click(); link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMessage('Przygotowano pobieranie. Zapisz plik w folderze presetu, zastępując poprzedni plik.');
    }

    async function replaceOriginal() {
        if (!loaded?.handle || busy) return;
        setBusy(true); setError(''); setMessage('');
        try {
            const current = await readConfig(await loaded.handle.getFile());
            if (current !== loaded.original) throw new Error('Plik zmienił się od wczytania. Wybierz go ponownie przed zapisaniem.');
            const stream = await loaded.handle.createWritable();
            try {
                await stream.write(loaded.updated.content);
                await stream.close();
            } catch (cause) {
                await stream.abort().catch(() => undefined);
                throw cause;
            }
            setLoaded({ ...loaded, original: loaded.updated.content });
            setMessage('Zapisano nowe wagi w wybranym pliku .cfg.');
        } catch (cause) {
            setError(cause instanceof Error && cause.message.startsWith('Plik zmienił') ? cause.message : 'Nie udało się zapisać pliku. Możesz pobrać gotowy .cfg i zastąpić go ręcznie.');
        } finally { setBusy(false); }
    }

    return <section className="mb-6 rounded-lg border border-zinc-700 bg-zinc-800/80 p-4">
        <h2 className="font-brook text-xl font-bold text-yellow-400">Zastosuj wagi w pliku ustawień</h2>
        <p className="mt-2 text-sm text-gray-400">Wybierz plik .cfg. Podmienimy tylko szanse ról, zaokrąglone do pełnego 1%. Role z Num = 0 pozostają wyłączone. Plik jest przetwarzany w przeglądarce.</p>
        <label className="mt-4 block text-sm text-gray-300">Folder presetu — skopiuj ścieżkę do okna wyboru pliku
            <input readOnly value={MIRA_PRESET_PATH} onFocus={event => event.target.select()} className="mt-2 w-full rounded-lg border border-gray-600 bg-zinc-900 px-3 py-2 text-sm text-white" />
        </label>
        <p className="mt-2 text-sm text-gray-400">Przy pierwszym wyborze wskaż folder ręcznie. Opcja otwarcia do zapisu może zapamiętać ostatni folder w obsługiwanych przeglądarkach.</p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
            <label className="min-w-48 flex-1 text-sm text-gray-300">Plik ustawień (.cfg)
                <input ref={inputRef} type="file" accept=".cfg" disabled={busy} onChange={event => void selectFile(event.target.files?.[0])} className="mt-2 block w-full rounded-lg border border-gray-600 bg-zinc-900 text-gray-300 file:mr-3 file:cursor-pointer file:border-0 file:bg-zinc-700 file:px-3 file:py-2 file:text-white disabled:opacity-50" />
            </label>
            {supportsPicker && <button type="button" className={secondaryClass} disabled={busy} onClick={() => void openForWriting()}>Otwórz .cfg do zapisu</button>}
        </div>
        {loaded && <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-300">{loaded.name} · Zmienione wagi: {loaded.updated.updated} · Wyłączone role pominięte: {loaded.updated.disabled}</p>
            {loaded.updated.unmatched.length > 0 && <p className="text-sm text-yellow-300">Bez dopasowania — pozostawiono oryginalne wartości: {loaded.updated.unmatched.join(', ')}.</p>}
            <div className="flex flex-wrap gap-3">
                <button type="button" disabled={busy} onClick={download} className={buttonClass}>Pobierz {loaded.name}</button>
                {loaded.handle && <button type="button" disabled={busy} onClick={() => void replaceOriginal()} className={secondaryClass}>Zapisz i zastąp wybrany plik</button>}
            </div>
            <p className="text-sm text-gray-400">Przy pobieraniu przeglądarka wybiera miejsce zapisu. Aby zastąpić plik w jego obecnej lokalizacji, użyj opcji „Otwórz .cfg do zapisu” i zapisz zmiany albo wskaż folder presetu podczas pobierania.</p>
        </div>}
        {busy && <p className="mt-3 text-sm text-gray-400" role="status">Przetwarzanie pliku…</p>}
        {error && <p className="mt-3 text-sm text-red-300" role="alert">{error}</p>}
        {message && <p className="mt-3 text-sm text-green-400" role="status">{message}</p>}
    </section>;
}
