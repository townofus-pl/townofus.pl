import { MAX_SETTINGS_FILE_SIZE_BYTES, validateSettingsContent } from '@/app/api/dramaafera/settings/utils';

export interface CfgField {
    id: string;
    section: string;
    key: string;
    value: string;
    line: number;
    prefix: string;
    suffix: string;
    valueType?: string;
    defaultValue?: string;
    options?: string[];
    minimum?: number;
    maximum?: number;
}

export interface CfgDocument {
    lines: Array<{ text: string; ending: string }>;
    fields: CfgField[];
}

/** Keep the original text, including BOM, whitespace, unknown sections and mixed line endings. */
export function parseCfgDocument(content: string): CfgDocument {
    const contentError = validateSettingsContent(content);
    if (contentError) throw new Error(contentError);
    if (new TextEncoder().encode(content).length > MAX_SETTINGS_FILE_SIZE_BYTES) {
        throw new Error('Plik nie może być większy niż 5 MB.');
    }
    const parts = content.split(/(\r\n|\n|\r)/);
    const lines: CfgDocument['lines'] = [];
    for (let index = 0; index < parts.length; index += 2) {
        lines.push({ text: parts[index], ending: parts[index + 1] ?? '' });
    }
    const fields: CfgField[] = [];
    const seen = new Set<string>();
    let section = '';
    let metadata: Partial<Pick<CfgField, 'valueType' | 'defaultValue' | 'options' | 'minimum' | 'maximum'>> = {};
    let hasRoles = false;
    lines.forEach(({ text }, line) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        if (trimmed.startsWith('#') || trimmed.startsWith(';')) {
            const type = trimmed.match(/^# Setting type:\s*(.+)$/);
            const defaultValue = trimmed.match(/^# Default value:\s*(.*)$/);
            const options = trimmed.match(/^# Acceptable values:\s*(.+)$/);
            const range = trimmed.match(/^# Acceptable value range: From ([-+\d.eE]+) to ([-+\d.eE]+)$/);
            if (type) metadata.valueType = type[1];
            if (defaultValue) metadata.defaultValue = defaultValue[1];
            if (options) metadata.options = options[1].split(',').map(option => option.trim());
            if (range) {
                metadata.minimum = Number(range[1]);
                metadata.maximum = Number(range[2]);
            }
            return;
        }
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            section = trimmed.slice(1, -1).trim();
            if (section === 'Roles') hasRoles = true;
            metadata = {};
            return;
        }
        const equals = text.indexOf('=');
        const key = text.slice(0, equals).trim();
        if (!section || equals < 1 || !key) {
            throw new Error(`Nieprawidłowy wpis w wierszu ${line + 1}. Wybierz plik ustawień TOU:Mira .cfg.`);
        }
        const id = JSON.stringify([section, key]);
        if (seen.has(id)) throw new Error(`Powtórzony klucz „${key}” w sekcji „${section}”.`);
        seen.add(id);
        const after = text.slice(equals + 1);
        const leading = after.match(/^\s*/)?.[0] ?? '';
        const value = after.trim();
        fields.push({
            id, section, key, value, line,
            prefix: text.slice(0, equals + 1) + leading,
            suffix: value ? after.slice(leading.length + value.length) : '',
            ...metadata,
            // The mod serializes this count as Single; the editor accepts Int32 guesses only.
            ...(section === 'TownOfUs.Options.Roles.Neutral.DoomsayerOptions' && key === 'DoomsayerGuessesToWin'
                ? { valueType: 'Int32' } : {}),
        });
        metadata = {};
    });
    if (!hasRoles || !fields.some(field => field.section === 'Roles' && /^(Num|Chance)\s+/.test(field.key))) {
        throw new Error('To nie jest plik ustawień TOU:Mira. Brakuje sekcji [Roles] z ustawieniami ról.');
    }
    return { lines, fields };
}

export function cfgValueKind(field: CfgField): 'boolean' | 'integer' | 'number' | 'text' {
    if (field.options?.length) return 'text';
    if (field.valueType === 'Boolean' || (!field.valueType && /^(true|false)$/i.test(field.value))) return 'boolean';
    if (/^(Int32|Int64|UInt32|Byte)$/.test(field.valueType ?? '')) return 'integer';
    if (/^(Single|Double|Decimal)$/.test(field.valueType ?? '') ||
        (!field.valueType && /^[-+]?\d+(?:[.,]\d+)?$/.test(field.value))) return 'number';
    return 'text';
}

export function allowsNegativeOne(field: CfgField): boolean {
    return (field.section === 'TownOfUs.Options.Roles.Crewmate.EngineerOptions' && field.key === 'MaxVents') ||
        (field.section === 'TownOfUs.Options.Roles.Crewmate.HunterOptions' && (field.key === 'StalkPerTasks' || field.key === 'StalkUses'));
}

export function getCfgMinimum(field: CfgField): number {
    return allowsNegativeOne(field) ? -1 : Math.max(0, field.minimum ?? 0);
}

export function validateCfgValue(field: CfgField, value: string): string | null {
    if (/[\r\n\0\uFFFD]/.test(value)) return 'Wartość nie może zawierać nowych wierszy ani znaków binarnych.';
    if (field.options?.length) {
        return field.options.includes(value) ? null : 'Wybierz jedną z dostępnych wartości.';
    }
    const kind = cfgValueKind(field);
    if (kind === 'boolean') return /^(true|false)$/i.test(value) ? null : 'Wybierz Tak lub Nie.';
    if (kind === 'number' || kind === 'integer') {
        const normalized = value.trim().replace(',', '.');
        if (!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/.test(normalized) || !Number.isFinite(Number(normalized))) {
            return 'Podaj poprawną liczbę.';
        }
        const numeric = Number(normalized);
        const specialNegativeOne = allowsNegativeOne(field) && numeric === -1;
        if (numeric < 0 && !specialNegativeOne) return 'Minimalna wartość: 0. Tylko wybrane ustawienia dopuszczają -1.';
        if (kind === 'integer' && !Number.isSafeInteger(numeric)) return 'Podaj liczbę całkowitą.';
        if (field.valueType === 'Int32' && (numeric < -2147483648 || numeric > 2147483647)) return 'Liczba jest poza zakresem Int32.';
        if (field.valueType === 'UInt32' && (numeric < 0 || numeric > 4294967295)) return 'Liczba jest poza zakresem UInt32.';
        if (field.valueType === 'Byte' && (numeric < 0 || numeric > 255)) return 'Podaj liczbę od 0 do 255.';
        if (field.valueType === 'Single' && Math.abs(numeric) > 3.4028234663852886e38) return 'Liczba jest poza zakresem Single.';
        if (!specialNegativeOne && numeric < Math.max(0, field.minimum ?? 0)) return `Minimalna wartość: ${Math.max(0, field.minimum ?? 0)}.`;
        if (field.maximum !== undefined && numeric > field.maximum) return `Maksymalna wartość: ${field.maximum}.`;
    }
    return null;
}

/** Patch by exact identity; never regenerate the document from the simplified display model. */
export function exportCfgDocument(document: CfgDocument, changes: Readonly<Record<string, string>>): string {
    const fields = new Map(document.fields.map(field => [field.id, field]));
    const lines = document.lines.map(line => ({ ...line }));
    for (const [id, value] of Object.entries(changes)) {
        const field = fields.get(id);
        if (!field) throw new Error('Nieznane ustawienie. Wczytaj ponownie plik.');
        const error = validateCfgValue(field, value);
        if (error) throw new Error(`${field.key}: ${error}`);
        if (value === field.value) continue;
        const kind = cfgValueKind(field);
        const serialized = kind === 'integer' || kind === 'number' ? value.trim().replace(',', '.') : value;
        lines[field.line].text = field.prefix + serialized + field.suffix;
    }
    return lines.map(line => line.text + line.ending).join('');
}
