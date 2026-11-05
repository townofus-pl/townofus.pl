import { cfgValueKind, getCfgMinimum, validateCfgValue } from './cfgDocument';
import type { EditorField } from './editorFields';

export function hasInfinityValue(field: EditorField): boolean {
    return Object.values(field.description ?? {}).some(label => label.trim() === '∞');
}

export function hasOffValue(field: EditorField): boolean {
    return Object.values(field.description ?? {}).some(label => label.trim().toLowerCase() === 'off');
}

export function formatNumericValue(field: EditorField, value: string): string {
    if (!value.trim() || validateCfgValue(field, value)) return value;
    const numeric = Number(value.replace(',', '.'));
    if (field.description?.[numeric]?.trim() === '∞') return '∞';
    if (field.description?.[numeric]?.trim().toLowerCase() === 'off') return 'Off';
    if (field.unit === '×') return `${numeric.toFixed(2)}x`;
    return `${numeric}${field.unit ?? ''}`;
}

export function stepNumericValue(field: EditorField, value: string, direction: -1 | 1): string | null {
    if (validateCfgValue(field, value)) return null;
    const step = field.unit === '×' && cfgValueKind(field) !== 'integer' ? 0.25 : 1;
    let next = Number((Number(value.replace(',', '.')) + direction * step).toPrecision(15));
    next = Math.max(next, getCfgMinimum(field));
    if (field.maximum !== undefined) next = Math.min(next, field.maximum);
    const result = String(next);
    return result === value || validateCfgValue(field, result) ? null : result;
}
