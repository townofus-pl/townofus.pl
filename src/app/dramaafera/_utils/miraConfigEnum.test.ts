import { buildMiraRoleSettings, canonicalEnumValue } from './miraConfig';
import { enumNameToOrdinal, updateSettingValue } from './settingsParser';
import { MIRA_ROLE_SETTINGS } from '@/roles/_generated/miraSettings';
import { SettingTypes } from '@/constants/settings';

const section = (role: string, lines: string[]) =>
    `[Roles]\n\n[TownOfUs.Options.Roles.Crewmate.${role}Options]\n${lines.join('\n')}\n`;

describe('text options in a TOU-Mira 1.7.9-beta2 config', () => {
    it('reads an enum name as the ordinal, so the label map applies', () => {
        const s = buildMiraRoleSettings(section('Altruist', ['ReviveMode = GroupRevive']), 'Altruist');
        expect(s['Revive Type'].value).toBe(2);
        expect(s['Revive Type'].description?.[2]).toBe('Group Revive');
    });

    it('matches a name without case or spacing', () => {
        const s = buildMiraRoleSettings(section('Altruist', ['ReviveMode = group revive']), 'Altruist');
        expect(s['Revive Type'].value).toBe(2);
    });

    it('reads the old number as before', () => {
        const s = buildMiraRoleSettings(section('Altruist', ['ReviveMode = 2']), 'Altruist');
        expect(s['Revive Type'].value).toBe(2);
        expect(s['Revive Type'].description?.[2]).toBe('Group Revive');
    });

    it('keeps a name that is not in the list as a string, never NaN', () => {
        const s = buildMiraRoleSettings(section('Altruist', ['ReviveMode = SomethingNew']), 'Altruist');
        expect(s['Revive Type'].value).toBe('SomethingNew');
    });

    it('shows the raw name of an option with no name list (Blindspot room)', () => {
        const s = buildMiraRoleSettings(section('Sentry', ['Blindspot1Room = Specimens']), 'Sentry');
        const room = Object.values(s)[0];
        expect(room.value).toBe('Specimens');
        expect(Number.isNaN(room.value)).toBe(false);
    });

    it('does not turn a plain number into a name or change numbers', () => {
        expect(updateSettingValue(SettingTypes.Number, '1,5')).toBe(1.5);
        expect(updateSettingValue(SettingTypes.Number, '2', ['A', 'B', 'C'])).toBe(2);
        expect(enumNameToOrdinal('B', ['A', 'B'])).toBe('1');
        expect(enumNameToOrdinal('2', undefined)).toBe('2');
    });

    it('gives an old number and its name the same canonical value', () => {
        const sec = 'TownOfUs.Options.Roles.Crewmate.AltruistOptions';
        expect(canonicalEnumValue(sec, 'ReviveMode', 'GroupRevive')).toBe('2');
        expect(canonicalEnumValue(sec, 'ReviveMode', '2')).toBe('2');
        expect(canonicalEnumValue(sec, 'ReviveRange', '0.5')).toBe('0.5');
        expect(canonicalEnumValue('Roles', 'Num X', 'Foo')).toBe('Foo');
    });

    it('gives no NaN for any role when every text option is written as a name', () => {
        for (const [role, defs] of Object.entries(MIRA_ROLE_SETTINGS)) {
            const lines = defs.map((d) => `${d.cfgKey} = ${d.names ? d.names[d.names.length - 1] : d.type === 'Boolean' ? 'true' : d.description ? '0' : 'Specimens'}`);
            const built = buildMiraRoleSettings(section(role, lines), role);
            for (const [label, setting] of Object.entries(built)) {
                expect([role, label, Number.isNaN(setting.value)]).toEqual([role, label, false]);
            }
        }
    });
});
