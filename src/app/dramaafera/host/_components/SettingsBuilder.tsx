'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { MAX_SETTINGS_FILE_SIZE_BYTES } from '@/app/api/dramaafera/settings/utils';
import { getSettingsDraftAction, saveSettingsDraftAction } from '../../_actions/settingsDraftActions';
import { normalizeLookupKey } from '../../_utils/miraConfig';
import { exportCfgDocument, parseCfgDocument, validateCfgValue, type CfgDocument } from '../_utils/cfgDocument';
import { isHnsField, resolveEditorField, safeCfgFileName, sortRoleGroups, type EditorCategory, type EditorField } from '../_utils/editorFields';
import SettingField from './SettingField';

interface Source { document: CfgDocument; name: string }
const categories: Array<{ id: EditorCategory; label: string }> = [
    { id: 'general', label: 'Ogólne' },
    { id: 'roles', label: 'Role' }, { id: 'modifiers', label: 'Modyfikatory' }, { id: 'advanced', label: 'Dodatkowe' },
];
const buttonClass = 'rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-gray-200 hover:border-yellow-400 hover:text-yellow-300 disabled:opacity-50';

function FieldGroup({ fields, changes, expanded, onChange }: {
    fields: EditorField[]; changes: Record<string, string>; expanded: boolean;
    onChange: (field: EditorField, value: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const first = fields[0];
    const changed = fields.filter(field => changes[field.id] !== undefined).length;
    const errors = fields.filter(field => validateCfgValue(field, changes[field.id] ?? field.value)).length;
    return (
        <details open={open || expanded} onToggle={event => { if (!expanded) setOpen(event.currentTarget.open); }} className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900/70">
            <summary className="flex cursor-pointer items-center gap-3 p-4 focus-visible:outline-yellow-400">
                {first.icon && <Image src={first.icon} alt="" width={36} height={36} className="h-9 w-9 object-contain" />}
                <span className="min-w-0 flex-1">
                    <span className="font-barlow text-2xl font-semibold" style={{ color: first.color }}>{first.groupName}</span>
                    <span className="ml-3 text-xs text-gray-400">{fields.length} opcji{changed > 0 && ` · zmieniono: ${changed}`}{errors > 0 && ` · błędy: ${errors}`}</span>
                    <span className="mt-1 block break-all text-xs text-gray-500">{[...new Set(fields.map(field => field.section))].join(' · ')}</span>
                </span>
                <span aria-hidden="true" className="text-gray-400">{open || expanded ? '−' : '+'}</span>
            </summary>
            {(open || expanded) && fields.map(field => <SettingField key={field.id} field={field} value={changes[field.id] ?? field.value} onChange={value => onChange(field, value)} />)}
        </details>
    );
}

export default function SettingsBuilder() {
    const [source, setSource] = useState<Source | null>(null);
    const [changes, setChanges] = useState<Record<string, string>>({});
    const [pendingSource, setPendingSource] = useState<Source | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('moje-ustawienia.cfg');
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<EditorCategory>('general');
    const [onlyChanged, setOnlyChanged] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);
    const request = useRef(0);
    const draftToken = useRef('');
    const savedContent = useRef('');
    const saving = useRef(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [saveError, setSaveError] = useState('');
    const [saveTick, setSaveTick] = useState(0);
    const uploadId = useId();
    const searchId = useId();
    const nameId = useId();
    const changedCount = Object.keys(changes).length;

    const fields = useMemo(() => source?.document.fields.filter(field => !isHnsField(field)).map(resolveEditorField) ?? [], [source]);
    const invalid = useMemo(() => fields.filter(field => validateCfgValue(field, changes[field.id] ?? field.value)), [fields, changes]);
    const groups = useMemo(() => {
        const matching = new Map<string, EditorField[]>();
        const search = normalizeLookupKey(query);
        for (const field of fields) {
            if (field.category !== category) continue;
            if (onlyChanged && changes[field.id] === undefined) continue;
            if (search && !normalizeLookupKey(`${field.groupName} ${field.label} ${field.key} ${field.section}`).includes(search)) continue;
            const group = matching.get(field.groupId) ?? [];
            group.push(field);
            matching.set(field.groupId, group);
        }
        return sortRoleGroups([...matching.values()], fields, changes);
    }, [fields, category, query, onlyChanged, changes]);

    const content = useMemo(() => {
        if (!source || invalid.length) return null;
        return exportCfgDocument(source.document, changes);
    }, [source, changes, invalid.length]);
    const unsaved = !!source && (content === null || content !== savedContent.current);

    useEffect(() => {
        if (!unsaved) return;
        const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [unsaved]);

    const applySource = (next: Source) => {
        setSource(next); setChanges({}); setPendingSource(null); setConfirmReset(false);
        setQuery(''); setCategory('general'); setOnlyChanged(false); setError('');
        setFileName(safeCfgFileName(next.name.replace(/\.cfg$/i, '') + '-wlasne'));
    };
    const acceptSource = (next: Source) => {
        setPendingSource(next);
    };

    const loadCurrent = async () => {
        if (saving.current) return;
        if (source && unsaved && !window.confirm('Wczytanie draftu usunie niezapisane zmiany w tym edytorze. Kontynuować?')) return;
        const token = ++request.current;
        setLoading(true); setError(''); setMessage('');
        try {
            const result = await getSettingsDraftAction();
            if (!result.success) throw new Error(result.error);
            const document = parseCfgDocument(result.data.content);
            if (token !== request.current) return;
            draftToken.current = result.data.token;
            savedContent.current = result.data.content;
            applySource({ document, name: result.data.exists ? 'draft-ustawien.cfg' : 'aktualne-ustawienia.cfg' });
            setSaveError('');
            setSaveStatus(result.data.exists ? 'Wczytano wspólny draft.' : 'Pierwsza zmiana utworzy wspólny draft aktualnych ustawień.');
        } catch (cause) {
            if (token === request.current) setError(cause instanceof Error ? cause.message : 'Nie udało się wczytać pliku.');
        } finally { if (token === request.current) setLoading(false); }
    };

    useEffect(() => { void loadCurrent(); }, []); // Initial shared snapshot; subsequent reloads are explicit.

    useEffect(() => {
        if (!content || !draftToken.current || content === savedContent.current || saving.current || saveError || loading || pendingSource) return;
        const timer = window.setTimeout(async () => {
            saving.current = true;
            setSaveStatus('Zapisywanie draftu…');
            try {
                const result = await saveSettingsDraftAction(content, draftToken.current);
                if (!result.success) {
                    setSaveError(result.error);
                    setSaveStatus('Zmiany nie zostały zapisane.');
                    return;
                }
                draftToken.current = result.data.token;
                savedContent.current = result.data.content;
                setSaveStatus('Draft zapisany w bazie.');
            } catch {
                setSaveError('Nie udało się zapisać draftu. Sprawdź połączenie i spróbuj ponownie.');
                setSaveStatus('Zmiany nie zostały zapisane.');
            } finally {
                saving.current = false;
                setSaveTick(tick => tick + 1);
            }
        }, 1200);
        return () => window.clearTimeout(timer);
    }, [content, saveTick, saveError, loading, pendingSource]);

    const importFile = async (file: File) => {
        const token = ++request.current;
        setLoading(true); setError(''); setMessage('');
        try {
            if (!/\.cfg$/i.test(file.name)) throw new Error('Wybierz plik z rozszerzeniem .cfg.');
            if (!file.size || file.size > MAX_SETTINGS_FILE_SIZE_BYTES) throw new Error('Wybierz niepusty plik .cfg o rozmiarze do 5 MB.');
            // ignoreBOM keeps the BOM as part of the document, so export preserves it too.
            const content = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(await file.arrayBuffer());
            const document = parseCfgDocument(content);
            if (token !== request.current) return;
            acceptSource({ document, name: file.name });
            setMessage(`Wczytano plik ${file.name}.`);
        } catch (cause) {
            if (token === request.current) setError(cause instanceof TypeError ? 'Plik nie jest poprawnym tekstem UTF-8.' : cause instanceof Error ? cause.message : 'Nie udało się wczytać pliku.');
        } finally { if (token === request.current) setLoading(false); }
    };

    useEffect(() => () => { request.current += 1; }, []);

    const changeField = (field: EditorField, value: string) => {
        setChanges(previous => {
            const next = { ...previous };
            if (value === field.value) delete next[field.id]; else next[field.id] = value;
            return next;
        });
        setConfirmReset(false);
    };
    const download = () => {
        if (!source || invalid.length) return;
        try {
            const content = exportCfgDocument(source.document, changes);
            const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
            const link = document.createElement('a');
            link.href = url; link.download = safeCfgFileName(fileName);
            document.body.appendChild(link); link.click(); link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            setMessage('Plik gotowy do pobrania. Umieść go w folderze presetów TOU:Mira w grze.');
        } catch (cause) { setError(cause instanceof Error ? cause.message : 'Nie udało się przygotować pliku.'); }
    };

    return (
        <section aria-label="Kreator ustawień" className="space-y-5 font-barlow">
            <div>
                <h3 className="font-brook text-3xl text-yellow-400">Kreator ustawień</h3>
                <p className="mt-2 text-gray-300">Edytujesz wspólny draft ustawień. Poprawne zmiany zapisują się automatycznie w bazie i są dostępne dla wszystkich hostów. Aktualny zestaw do gry zmienia się dopiero po wgraniu pliku.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => void loadCurrent()} disabled={loading || !!pendingSource || saving.current} className={buttonClass}>{loading ? 'Wczytywanie…' : 'Wczytaj draft ponownie'}</button>
                <label htmlFor={uploadId} className="text-sm text-gray-300">Importuj .cfg</label>
                <input id={uploadId} type="file" accept=".cfg" disabled={loading || !!pendingSource || !draftToken.current || saving.current} className="max-w-full text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-700 file:px-3 file:py-2 file:text-white"
                    onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void importFile(file); }} />
            </div>
            <p role="status" aria-live="polite" className="text-sm text-gray-300">{saving.current ? 'Zapisywanie draftu…' : unsaved && !saveError ? 'Oczekujące zmiany w drafcie…' : saveStatus}</p>
            {saveError && <div role="alert" className="space-y-3 rounded-lg border border-red-800 bg-red-950/40 p-3 text-red-200"><p>{saveError}</p><button type="button" className={buttonClass} onClick={() => { setSaveError(''); setSaveTick(tick => tick + 1); }}>Ponów zapis</button></div>}
            {message && <p role="status" className="rounded-lg border border-zinc-600 bg-zinc-800 p-3 text-sm text-gray-200">{message}</p>}
            {error && <p role="alert" className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-red-200">{error}</p>}
            {pendingSource && <div className="space-y-3 rounded-lg border border-yellow-600 bg-yellow-900/20 p-4" role="alert">
                <p>Wczytanie „{pendingSource.name}” zastąpi wspólny draft i zapisze go w bazie. Bieżące zmiany w tym edytorze: {changedCount}.</p>
                <div className="flex gap-3"><button type="button" className={buttonClass} onClick={() => applySource(pendingSource)}>Zastąp zestaw</button><button type="button" className={buttonClass} onClick={() => { setPendingSource(null); setMessage('Zachowano bieżący zestaw.'); }}>Zachowaj zmiany</button></div>
            </div>}
            {!source && <p className="rounded-xl border border-dashed border-zinc-600 p-6 text-gray-400">Zacznij od wczytania ustawień. Możesz importować własny preset, np. MIRA7.cfg.</p>}
            {source && <>
                <div className="rounded-xl border border-zinc-700 bg-zinc-950/50 p-4">
                    <p className="break-all text-sm text-gray-300">Baza: <strong>{source.name}</strong> · {fields.length} opcji · Zmieniono: {changedCount}</p>
                    <p className="mt-1 text-xs text-gray-500">Draft jest wspólny dla wszystkich hostów. Import pliku zastępuje jego zawartość po potwierdzeniu. Pobierz .cfg, aby użyć draftu w grze.</p>
                    <div className="mt-4 flex flex-wrap items-end gap-3">
                        <div className="min-w-0 flex-1"><label htmlFor={nameId} className="mb-1 block text-sm text-gray-300">Nazwa pliku</label><input id={nameId} value={fileName} maxLength={110} onChange={event => setFileName(event.target.value)} className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2" /></div>
                        <button type="button" onClick={download} disabled={!!invalid.length || loading || !!pendingSource} className="rounded-lg bg-yellow-500 px-5 py-2 font-semibold text-zinc-950 hover:bg-yellow-400 disabled:opacity-50">Pobierz .cfg</button>
                        <button type="button" disabled={!changedCount || loading || !!pendingSource} onClick={() => setConfirmReset(true)} className={buttonClass}>Cofnij wszystkie zmiany</button>
                    </div>
                    {confirmReset && <div className="mt-4 flex flex-wrap items-center gap-3"><span>Cofnąć wszystkie zmiany?</span><button type="button" className={buttonClass} onClick={() => { setChanges({}); setConfirmReset(false); }}>Tak, cofnij</button><button type="button" className={buttonClass} onClick={() => setConfirmReset(false)}>Anuluj</button></div>}
                    {invalid.length > 0 && <p role="alert" className="mt-3 text-sm text-red-300">Popraw nieprawidłowe wartości przed pobraniem ({invalid.length}). Pierwsza: {invalid[0].groupName} — {invalid[0].label}.</p>}
                </div>
                <div className="space-y-3">
                    <label htmlFor={searchId} className="block text-sm text-gray-300">Szukaj roli, grupy lub opcji</label>
                    <input id={searchId} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Np. Sheriff, cooldown, Slot1…" className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-4 py-3" />
                    <div className="flex flex-wrap gap-2" aria-label="Kategorie ustawień">{categories.map(item => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)} className={`${buttonClass} ${category === item.id ? 'border-yellow-400 bg-yellow-500/10 text-yellow-300' : ''}`}>{item.label}</button>)}</div>
                    <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={onlyChanged} onChange={event => setOnlyChanged(event.target.checked)} className="accent-yellow-400" />Tylko zmienione opcje</label>
                </div>
                <fieldset disabled={loading || !!pendingSource} className="min-w-0 space-y-3 disabled:opacity-60"><legend className="sr-only">Opcje presetu</legend>{groups.map(group => <FieldGroup key={group[0].groupId} fields={group} changes={changes} expanded={!!query || onlyChanged} onChange={changeField} />)}{!groups.length && <p className="p-4 text-gray-400">Brak opcji pasujących do filtrów.</p>}</fieldset>
                {changedCount > 0 && <details className="rounded-xl border border-yellow-700/50 bg-yellow-950/10 p-4"><summary className="cursor-pointer font-brook text-2xl text-yellow-300">Podsumowanie zmian ({changedCount})</summary><ul className="mt-3 space-y-3">{fields.filter(field => changes[field.id] !== undefined).map(field => <li key={field.id} className="break-words text-sm"><strong>{field.groupName} — {field.label}</strong><span className="block text-xs text-gray-500">{field.section} · {field.key}</span><span className="text-gray-400">{field.value || '(puste)'}</span> → <span className="text-yellow-200">{changes[field.id] || '(puste)'}</span></li>)}</ul></details>}
            </>}
        </section>
    );
}
