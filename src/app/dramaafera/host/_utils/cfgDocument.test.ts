import { readFileSync } from 'node:fs';
import { cfgValueKind, exportCfgDocument, getCfgMinimum, parseCfgDocument, validateCfgValue } from './cfgDocument';

const prefix = '[Roles]\n# Setting type: Int32\nNum TownOfUs.Roles.Crewmate.SheriffRole = 1\n# Setting type: Int32\nChance TownOfUs.Roles.Crewmate.SheriffRole = 51\n';
const reference = readFileSync('public/settings/mira.cfg', 'utf8');

test('numeric settings default to zero minimum; only explicit options accept the -1 sentinel', () => {
    const fields = parseCfgDocument(reference).fields;
    const ordinary = fields.find(field => field.key === 'HunterStalkCooldown')!;
    expect(getCfgMinimum(ordinary)).toBe(0);
    expect(validateCfgValue(ordinary, '-1')).not.toBeNull();
    expect(validateCfgValue(ordinary, '0')).toBeNull();
    for (const key of ['MaxVents', 'StalkPerTasks', 'StalkUses']) {
        const field = fields.find(field => field.key === key)!;
        expect(getCfgMinimum(field)).toBe(-1);
        expect(validateCfgValue(field, '-1')).toBeNull();
        expect(validateCfgValue(field, '-0.5')).not.toBeNull();
        expect(validateCfgValue(field, '-2')).not.toBeNull();
        expect(validateCfgValue(field, '0')).toBeNull();
        expect(exportCfgDocument(parseCfgDocument(reference), { [field.id]: '-1' })).toContain(`${key} = -1`);
    }
});

describe('CFG import/export', () => {
    it('treats Doomsayer guesses to win as Int32 even when the preset declares Single', () => {
        const document = parseCfgDocument(reference);
        const field = document.fields.find(entry => entry.section === 'TownOfUs.Options.Roles.Neutral.DoomsayerOptions' && entry.key === 'DoomsayerGuessesToWin')!;
        expect(field.valueType).toBe('Int32');
        expect(cfgValueKind(field)).toBe('integer');
        expect(validateCfgValue(field, '4')).toBeNull();
        expect(validateCfgValue(field, '3.5')).toBe('Podaj liczbę całkowitą.');
        expect(validateCfgValue(field, '2147483648')).toBe('Liczba jest poza zakresem Int32.');
        expect(() => exportCfgDocument(document, { [field.id]: '3.5' })).toThrow('Podaj liczbę całkowitą.');
        expect(exportCfgDocument(document, { [field.id]: '4' })).toBe(reference.replace('DoomsayerGuessesToWin = 3', 'DoomsayerGuessesToWin = 4'));
    });

    it('preserves the entire reference preset without any changes', () => {
        const document = parseCfgDocument(reference);
        expect(document.fields.length).toBeGreaterThan(900);
        expect(exportCfgDocument(document, {})).toBe(reference);
        expect(document.fields.filter(field => validateCfgValue(field, field.value))).toEqual([]);
    });

    it('preserves BOM, mixed newlines, comments, blank strings and trailing spaces', () => {
        const content = '\uFEFF' + prefix.replace(/\n/g, '\r\n') + '\n[Unknown]\r# preserve me\n  Label =     \r\nValue = a=b  ';
        const document = parseCfgDocument(content);
        expect(exportCfgDocument(document, {})).toBe(content);
        const field = document.fields.find(entry => entry.key === 'Label')!;
        expect(exportCfgDocument(document, { [field.id]: 'hello' })).toBe(content.replace('  Label =     ', '  Label =     hello'));
    });

    it('exports edited Num and Chance as decimal integers even without type comments', () => {
        const content = '[Roles]\r\nNum TownOfUs.Roles.Crewmate.SheriffRole = 2\r\nChance TownOfUs.Roles.Crewmate.SheriffRole = 51\r\n';
        const document = parseCfgDocument(content);
        const [num, chance] = document.fields;
        expect(exportCfgDocument(document, { [num.id]: '1.0', [chance.id]: '5e1' }))
            .toBe(content.replace(' = 2', ' = 1').replace(' = 51', ' = 50'));
        expect(() => exportCfgDocument(document, { [num.id]: '1.5' })).toThrow('Podaj liczbę całkowitą');
    });

    it('changes only Chance, leaving Num and similarly named HideAndSeek fields intact', () => {
        const content = prefix + '[TownOfUs.Options.Roles.HideAndSeek.SheriffOptions]\nChance = 0\n';
        const document = parseCfgDocument(content);
        const chance = document.fields.find(field => field.key.startsWith('Chance '))!;
        expect(exportCfgDocument(document, { [chance.id]: '25' })).toBe(content.replace('SheriffRole = 51', 'SheriffRole = 25'));
    });

    it('keeps team modifier chances and unknown sections independent', () => {
        const content = prefix + '[TeamModifiers]\nImpOverclockerChance = 10\nNeutOverclockerChance = 20\n[Unknown]\nImpOverclockerChance = 30\n';
        const document = parseCfgDocument(content);
        const field = document.fields.find(entry => entry.section === 'TeamModifiers' && entry.key === 'ImpOverclockerChance')!;
        expect(exportCfgDocument(document, { [field.id]: '40' })).toBe(content.replace('ImpOverclockerChance = 10', 'ImpOverclockerChance = 40'));
    });

    it('uses real acceptable enum values, including textual role slots', () => {
        const document = parseCfgDocument(prefix + '[Slots]\n# Setting type: RoleListOption\n# Default value: CrewCommon\n# Acceptable values: CrewCommon, ImpRandom, Any\nSlot1 = ImpRandom\n');
        const slot = document.fields.at(-1)!;
        expect(slot.options).toEqual(['CrewCommon', 'ImpRandom', 'Any']);
        expect(cfgValueKind(slot)).toBe('text');
        expect(exportCfgDocument(document, { [slot.id]: 'Any' })).toContain('Slot1 = Any');
        expect(() => exportCfgDocument(document, { [slot.id]: '1' })).toThrow('Wybierz');
    });

    it('validates integer, boolean, range and finite floating point values without rounding', () => {
        const document = parseCfgDocument(prefix + '[Options]\n# Setting type: Single\n# Acceptable value range: From 0 to 100\nCooldown = 1.234567\n# Setting type: Boolean\nEnabled = true\n');
        const count = document.fields[0];
        const cooldown = document.fields.find(field => field.key === 'Cooldown')!;
        const enabled = document.fields.find(field => field.key === 'Enabled')!;
        expect(validateCfgValue(count, '1.5')).not.toBeNull();
        expect(validateCfgValue(count, '2147483648')).not.toBeNull();
        for (const value of ['', 'NaN', 'Infinity', '0x20', '101', '-1']) expect(validateCfgValue(cooldown, value)).not.toBeNull();
        expect(validateCfgValue(enabled, 'yes')).not.toBeNull();
        expect(exportCfgDocument(document, { [cooldown.id]: '2,1234567' })).toContain('Cooldown = 2.1234567');
        expect(exportCfgDocument(document, {})).toContain('Cooldown = 1.234567');
    });

    it('rejects malformed/ambiguous imports and injected lines', () => {
        for (const content of ['hello', '[Roles]\n', prefix + 'bad line', prefix + 'Num TownOfUs.Roles.Crewmate.SheriffRole = 2', prefix + '\0', prefix + '\uFFFD']) {
            expect(() => parseCfgDocument(content)).toThrow();
        }
        const document = parseCfgDocument(prefix);
        expect(() => exportCfgDocument(document, { [document.fields[0].id]: '2\nInjected = true' })).toThrow();
        expect(() => exportCfgDocument(document, { unknown: '1' })).toThrow('Nieznane');
    });
});
