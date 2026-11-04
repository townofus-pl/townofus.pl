'use client';

import { useId } from 'react';
import { cfgValueKind, validateCfgValue } from '../_utils/cfgDocument';
import type { EditorField } from '../_utils/editorFields';
import NumericSettingControl from './NumericSettingControl';
import ChoiceSettingControl from './ChoiceSettingControl';

const inputClass = 'w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400';

export default function SettingField({ field, value, onChange }: {
    field: EditorField;
    value: string;
    onChange: (value: string) => void;
}) {
    const id = useId();
    const error = validateCfgValue(field, value);
    const kind = cfgValueKind(field);
    const numericEnum = (kind === 'integer' || kind === 'number') && field.description
        ? field.description : undefined;
    const options = field.options?.map(option => ({ value: option, label: option })) ??
        (numericEnum ? Object.entries(numericEnum).map(([key, label]) => ({ value: key, label })) : undefined);
    const choices = options;
    const changed = value !== field.value;

    return (
        <div className={`grid gap-3 border-t border-zinc-700/60 px-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(180px,280px)] ${changed ? 'bg-yellow-500/5' : ''}`}>
            <div className="min-w-0">
                <label htmlFor={id} className="block font-medium text-gray-100">{field.label}{field.unit && <span className="ml-2 text-sm text-gray-400">({field.unit})</span>}</label>
                <p id={`${id}-key`} className="mt-1 break-all text-xs text-gray-500">
                    {field.key}{!field.mapped && ' · opcja dodatkowa'}
                    {changed && <span className="ml-2 text-yellow-300">· Poprzednio: {field.value || '(puste)'}</span>}
                </p>
            </div>
            <div className="flex items-start gap-2">
                <div className="w-8 shrink-0">
                    {changed && <button type="button" onClick={() => onChange(field.value)}
                        aria-label={`Cofnij zmianę: ${field.label}`} title="Cofnij zmianę"
                        className="flex h-12 w-8 items-center justify-center rounded-md text-yellow-400 transition-colors hover:bg-yellow-400/10 hover:text-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400">
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                            <path d="M3 10a9 9 0 1 1 2.64 8.36M3 4v6h6" />
                        </svg>
                    </button>}
                </div>
                <div className="min-w-0 flex-1">
                {kind === 'boolean' ? (
                    <span className="relative inline-flex h-12 w-12 align-middle">
                        <input id={id} type="checkbox" checked={value.toLowerCase() === 'true'}
                            onChange={event => onChange(event.target.checked ? 'true' : 'false')}
                            aria-invalid={!!error} aria-describedby={`${id}-key${error ? ` ${id}-error` : ''}`}
                            className="peer h-12 w-12 cursor-pointer appearance-none rounded-md border-[3px] border-zinc-100 bg-[#141414] transition-colors hover:border-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50" />
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute inset-1 h-10 w-10 text-teal-300 opacity-0 peer-checked:opacity-100">
                            <path d="M4 12l5 5L20 5" stroke="currentColor" strokeWidth="4" />
                        </svg>
                    </span>
                ) : choices ? (
                    <ChoiceSettingControl id={id} label={field.label} value={value} choices={choices} error={error} onChange={onChange} />
                ) : kind === 'integer' || kind === 'number' ? (
                    <NumericSettingControl id={id} field={field} value={value} error={error} onChange={onChange} />
                ) : (
                    <input id={id} type="text" inputMode="text" value={value}
                        onChange={event => onChange(event.target.value)} className={inputClass} spellCheck={false}
                        aria-invalid={!!error} aria-describedby={`${id}-key${error ? ` ${id}-error` : ''}`} />
                )}
                {!choices && field.description?.[Number(value)] && <p className="mt-1 text-xs text-gray-400">{field.description[Number(value)]}</p>}
                {error && <p id={`${id}-error`} className="mt-1 text-sm text-red-300">{error}</p>}
                </div>
            </div>
        </div>
    );
}
