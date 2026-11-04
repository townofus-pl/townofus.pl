import { exportCfgDocument, parseCfgDocument } from './cfgDocument';
import { resolveEditorField } from './editorFields';
import { formatNumericValue, stepNumericValue } from './numericControl';

const content = '[Roles]\n# Setting type: Int32\nNum TownOfUs.Roles.Crewmate.SheriffRole = 3\n[Options]\n# Setting type: Single\nValue = 2.5\n';

test('formats time, multiplier and integers without adding units to the exported value', () => {
    const document = parseCfgDocument(content);
    const integer = resolveEditorField(document.fields[0]);
    const multiplier = { ...resolveEditorField(document.fields[1]), unit: '×' };
    expect(formatNumericValue(integer, '3')).toBe('3');
    expect(formatNumericValue({ ...multiplier, unit: 's' }, '8')).toBe('8s');
    expect(formatNumericValue(multiplier, '2.5')).toBe('2.50x');
    const next = stepNumericValue(multiplier, '2.5', 1)!;
    expect(next).toBe('2.75');
    expect(exportCfgDocument(document, { [multiplier.id]: next })).toBe(content.replace('Value = 2.5', 'Value = 2.75'));
});

test('steps whole counts and fractional multipliers while respecting bounds and invalid input', () => {
    const document = parseCfgDocument(content);
    const integer = resolveEditorField(document.fields[0]);
    const numeric = resolveEditorField(document.fields[1]);
    expect(stepNumericValue(integer, '3', 1)).toBe('4');
    expect(stepNumericValue(integer, '3', -1)).toBe('2');
    expect(stepNumericValue({ ...numeric, unit: '×' }, '0.1', 1)).toBe('0.35');
    expect(stepNumericValue(integer, '2147483647', 1)).toBeNull();
    expect(stepNumericValue({ ...numeric, maximum: 3 }, '2.5', 1)).toBe('3');
    expect(stepNumericValue({ ...numeric, minimum: 0 }, '0', -1)).toBeNull();
    expect(stepNumericValue(numeric, '', 1)).toBeNull();
    expect(formatNumericValue(numeric, 'invalid')).toBe('invalid');
});

test('Off and infinity remain numeric sentinels and can be incremented to ordinary values', () => {
    const numeric = resolveEditorField(parseCfgDocument(content).fields[1]);
    const off = { ...numeric, description: { 0: 'Off' } };
    const infinity = { ...numeric, description: { 0: '∞' } };
    expect(formatNumericValue(off, '0')).toBe('Off');
    expect(formatNumericValue(off, '3')).toBe('3');
    expect(formatNumericValue(infinity, '0')).toBe('∞');
    expect(stepNumericValue(off, '0', 1)).toBe('1');
    expect(stepNumericValue(off, '0', -1)).toBeNull();
});
