import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseCfgDocument } from '../_utils/cfgDocument';
import { resolveEditorField } from '../_utils/editorFields';
import SettingField from './SettingField';

const prefix = '[Roles]\nNum TownOfUs.Roles.Crewmate.SentryRole = 1\n';

test.each([
    ['Single', 's', '8', '8s'], ['Single', '×', '2.5', '2.50x'], ['Int32', undefined, '3', '3'],
] as const)('renders a numeric control for %s with unit %s', (type, unit, value, formatted) => {
    const document = parseCfgDocument(prefix + `[Options]\n# Setting type: ${type}\nValue = ${value}\n`);
    const field = { ...resolveEditorField(document.fields.at(-1)!), unit };
    const markup = renderToStaticMarkup(createElement(SettingField, { field, value, onChange: () => {} }));
    expect(markup).toContain('role="spinbutton"');
    expect(markup).toContain(`value="${formatted}"`);
    expect(markup).toContain('aria-label="Zmniejsz: Value"');
    expect(markup).toContain('aria-label="Zwiększ: Value"');
});

test.each([['true', true], ['False', false]] as const)('renders boolean %s as a labeled checkbox instead of a dropdown', (value, checked) => {
    const document = parseCfgDocument(prefix + `[Options]\n# Setting type: Boolean\nEnabled = ${value}\n`);
    const field = resolveEditorField(document.fields.at(-1)!);
    const markup = renderToStaticMarkup(createElement(SettingField, { field, value, onChange: () => {} }));
    expect(markup).toContain('type="checkbox"');
    expect(markup).not.toContain('<select');
    expect(markup.includes('checked=""')).toBe(checked);
    expect(markup).toContain('<label');
});

test('RoleOptions retains its group name and renders Role Assignment Type descriptions from the real preset', () => {
    const document = parseCfgDocument(readFileSync('public/settings/mira.cfg', 'utf8'));
    const raw = document.fields.find(field => field.section === 'TownOfUs.Options.RoleOptions' && field.key === 'RoleAssignmentType')!;
    const field = resolveEditorField(raw);
    expect(field).toMatchObject({ groupName: 'Role Settings', category: 'general', mapped: true });
    expect(field.description).toEqual({ 0: 'Vanilla', 1: 'Role List', 2: 'Min/Max List', 3: 'Draft' });
    const markup = renderToStaticMarkup(createElement(SettingField, { field, value: '3', onChange: () => {} }));
    expect(markup).toContain('<select');
    expect(markup).not.toContain('<input');
    expect(markup).toMatch(/<option value="3"[^>]*selected="">Draft<\/option>/);
    expect(markup).toContain('aria-label="Poprzednia opcja: Role Assignment Type"');
    expect(markup).toContain('aria-label="Następna opcja: Role Assignment Type"');
});

test('a numeric setting with Off uses a numeric control and displays Off only for its sentinel', () => {
    const document = parseCfgDocument(prefix + '[TownOfUs.Options.Roles.Crewmate.SentryOptions]\n# Setting type: Single\nBlindspotsCount = 0\n');
    const field = resolveEditorField(document.fields.at(-1)!);
    expect(field.description).toEqual({ 0: 'Off' });
    const markup = renderToStaticMarkup(createElement(SettingField, { field, value: '0', onChange: () => {} }));
    expect(markup).toContain('role="spinbutton"');
    expect(markup).not.toContain('<select');
    expect(markup).toContain('value="Off"');
    expect(renderToStaticMarkup(createElement(SettingField, { field, value: '3', onChange: () => {} }))).toContain('value="3"');
});

test('a textual CFG enum submits its actual game token rather than a description index', () => {
    const document = parseCfgDocument(prefix + '[Slots]\n# Setting type: RoleListOption\n# Acceptable values: CrewCommon, ImpRandom, Any\nSlot1 = ImpRandom\n');
    const field = resolveEditorField(document.fields.at(-1)!);
    const markup = renderToStaticMarkup(createElement(SettingField, { field, value: field.value, onChange: () => {} }));
    expect(markup).toContain('<select');
    expect(markup).toMatch(/<option value="ImpRandom"[^>]*selected=""/);
    expect(markup).not.toContain('value="1"');
});
