'use client';

import { useState } from 'react';
import type { EditorField } from '../_utils/editorFields';
import { formatNumericValue, stepNumericValue } from '../_utils/numericControl';
import { cfgValueKind, getCfgMinimum } from '../_utils/cfgDocument';
import { useFittedControlText } from './useFittedControlText';

const buttonClass = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-3xl font-bold leading-none text-zinc-950 hover:bg-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 disabled:cursor-not-allowed disabled:opacity-40';

export default function NumericSettingControl({ id, field, value, error, onChange }: {
    id: string; field: EditorField; value: string; error: string | null; onChange: (value: string) => void;
}) {
    const [focused, setFocused] = useState(false);
    const lower = stepNumericValue(field, value, -1);
    const higher = stepNumericValue(field, value, 1);
    const numeric = Number(value.replace(',', '.'));
    const displayedValue = focused ? value : formatNumericValue(field, value);
    const { ref, fontSize } = useFittedControlText<HTMLInputElement>(displayedValue);
    return (
        <div className="flex items-center gap-2">
            <button type="button" aria-label={`Zmniejsz: ${field.label}`} className={buttonClass} disabled={lower === null} onClick={() => { if (lower !== null) onChange(lower); }}>−</button>
            <input ref={ref} style={{ fontSize }} id={id} type="text" role="spinbutton" inputMode={cfgValueKind(field) === 'integer' ? 'numeric' : 'decimal'}
                value={displayedValue} onChange={event => onChange(event.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                onKeyDown={event => {
                    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                    event.preventDefault();
                    const next = event.key === 'ArrowUp' ? higher : lower;
                    if (next !== null) onChange(next);
                }}
                aria-valuenow={value.trim() && Number.isFinite(numeric) ? numeric : undefined}
                aria-valuemin={getCfgMinimum(field)} aria-valuemax={field.maximum}
                aria-valuetext={formatNumericValue(field, value)} aria-invalid={!!error}
                aria-describedby={`${id}-key${error ? ` ${id}-error` : ''}`} spellCheck={false}
                className="h-12 w-full min-w-0 rounded-md border-[3px] border-zinc-100 bg-[#141414] px-1 text-center font-barlow text-2xl font-extrabold tabular-nums text-white focus:border-yellow-300 focus:outline-none focus:ring-1 focus:ring-yellow-300" />
            <button type="button" aria-label={`Zwiększ: ${field.label}`} className={buttonClass} disabled={higher === null} onClick={() => { if (higher !== null) onChange(higher); }}>+</button>
        </div>
    );
}
