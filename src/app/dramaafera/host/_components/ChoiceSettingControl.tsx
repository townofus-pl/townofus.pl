'use client';

import { useFittedControlText } from './useFittedControlText';

const buttonClass = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-3xl font-bold leading-none text-zinc-950 hover:bg-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 disabled:cursor-not-allowed disabled:opacity-40';

export default function ChoiceSettingControl({ id, label, value, choices, error, onChange }: {
    id: string;
    label: string;
    value: string;
    choices: Array<{ value: string; label: string }>;
    error: string | null;
    onChange: (value: string) => void;
}) {
    const options = choices.some(option => option.value === value) ? choices : [
        { value, label: `${value || '(puste)'} — wartość z pliku` }, ...choices,
    ];
    const index = options.findIndex(option => option.value === value);
    const previous = options[(index - 1 + options.length) % options.length];
    const next = options[(index + 1) % options.length];
    const { ref, fontSize } = useFittedControlText<HTMLDivElement>(options[index]?.label ?? '');

    return (
        <div className="flex items-center gap-2">
            <button type="button" aria-label={`Poprzednia opcja: ${label}`} className={buttonClass} disabled={!previous}
                onClick={() => { if (previous) onChange(previous.value); }}>−</button>
            <div ref={ref} className="min-w-0 flex-1">
            <select style={{ fontSize }} id={id} value={value} onChange={event => onChange(event.target.value)}
                title={options[index]?.label} aria-invalid={!!error}
                aria-describedby={`${id}-key${error ? ` ${id}-error` : ''}`}
                className="h-12 w-full min-w-0 cursor-pointer appearance-none text-ellipsis rounded-md border-[3px] border-zinc-100 bg-[#141414] px-1 text-center font-barlow text-2xl font-extrabold text-white focus:border-yellow-300 focus:outline-none focus:ring-1 focus:ring-yellow-300">
                {options.map(option => <option key={option.value} value={option.value} className="font-barlow text-base font-normal">{option.label}</option>)}
            </select>
            </div>
            <button type="button" aria-label={`Następna opcja: ${label}`} className={buttonClass} disabled={!next}
                onClick={() => { if (next) onChange(next.value); }}>+</button>
        </div>
    );
}
