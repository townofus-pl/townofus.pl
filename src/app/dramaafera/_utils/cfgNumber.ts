/** Parse a decimal CFG value without accepting blanks or JavaScript-specific forms such as hex. */
export function parseCfgNumber(value: string): number | undefined {
    const normalized = value.trim().replace(',', '.');
    if (!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/.test(normalized)) return undefined;
    const number = Number(normalized);
    return Number.isFinite(number) ? number : undefined;
}

export function parseCfgRoleInteger(value: string): number | undefined {
    const number = parseCfgNumber(value);
    return number !== undefined && Number.isSafeInteger(number) && number >= 0 ? number : undefined;
}
