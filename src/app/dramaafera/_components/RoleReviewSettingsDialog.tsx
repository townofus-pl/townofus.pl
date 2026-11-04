'use client';

import { useEffect, useState } from 'react';
import { getReviewRoleSettingsAction } from '../_actions/roleBalanceReviewActions';
import { validateCfgValue } from '../host/_utils/cfgDocument';
import type { EditorField } from '../host/_utils/editorFields';
import type { RoleSettingsEdit } from '../_utils/roleReviewTypes';
import SettingField from '../host/_components/SettingField';
import ReviewModal from './ReviewModal';

export interface PendingRoleSettings extends RoleSettingsEdit { fields: EditorField[] }

export default function RoleReviewSettingsDialog({ seasonId, roleName, initial, onApply, onClose }: {
    seasonId: number; roleName: string; initial: PendingRoleSettings | null;
    onApply: (edit: PendingRoleSettings) => void; onClose: () => void;
}) {
    const [edit, setEdit] = useState<PendingRoleSettings | null>(initial);
    const [error, setError] = useState('');
    useEffect(() => {
        if (initial) return;
        let active = true;
        getReviewRoleSettingsAction(seasonId, roleName).then(data => {
            if (active) setEdit({ ...data, changes: {} });
        }).catch(cause => {
            if (active) setError(cause instanceof Error && /^(Brak |Nieprawidłowy)/.test(cause.message) ? cause.message : 'Nie udało się wczytać ustawień roli. Spróbuj ponownie.');
        });
        return () => { active = false; };
    }, [initial, seasonId, roleName]);
    const invalid = edit?.fields.some(field => validateCfgValue(field, edit.changes[field.id] ?? field.value));
    return <ReviewModal title={`Ustawienia roli: ${roleName}`} onClose={onClose}>
        <p className="mb-4 text-sm text-gray-300">Zmiany trafią do wspólnego draftu dopiero po zatwierdzeniu przeglądu. Pozostałe role zachowają swoje ustawienia.</p>
        {error && <p role="alert" className="text-red-300">{error}</p>}
        {!edit && !error && <p role="status">Wczytywanie ustawień…</p>}
        {edit && <>
            {edit.fields.map(field => <SettingField key={field.id} field={field} value={edit.changes[field.id] ?? field.value}
                onChange={value => setEdit(previous => {
                    if (!previous) return previous;
                    const changes = { ...previous.changes };
                    if (value === field.value) delete changes[field.id]; else changes[field.id] = value;
                    return { ...previous, changes };
                })} />)}
            <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" disabled={invalid} className="rounded-lg bg-blue-600 px-4 py-2 disabled:opacity-50" onClick={() => onApply(edit)}>Dołącz zmiany do przeglądu</button>
                <button type="button" className="rounded-lg bg-zinc-700 px-4 py-2" onClick={onClose}>Anuluj</button>
            </div>
        </>}
    </ReviewModal>;
}
