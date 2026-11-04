import { cfgValueKind, validateCfgValue } from './cfgDocument';
import type { EditorField } from './editorFields';

export function formatNumericValue(field: EditorField, value: string): string {
    if (!value.trim() || validateCfgValue(field, value)) return value;
    const numeric = Number(value.replace(',', '.'));
    if (field.unit === '×') return `${numeric.toFixed(2)}x`;
    return `${numeric}${field.unit ?? ''}`;
}

export function stepNumericValue(field: EditorField, value: string, direction: -1 | 1): string | null {
    if (validateCfgValue(field, value)) return null;
    const step = field.unit === '×' && cfgValueKind(field) !== 'integer' ? 0.25 : 1;
    let next = Number((Number(value.replace(',', '.')) + direction * step).toPrecision(15));
    if (field.minimum !== undefined) next = Math.max(next, field.minimum);
    if (field.maximum !== undefined) next = Math.min(next, field.maximum);
    const result = String(next);
    return result === value || validateCfgValue(field, result) ? null : result;
}
