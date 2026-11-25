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

    it('reads a Sentry room name or number as the same SystemTypes value, shown as the name', () => {
        const byName = buildMiraRoleSettings(section('Sentry', ['Blindspot1Room = Specimens']), 'Sentry');
        const byNumber = buildMiraRoleSettings(section('Sentry', ['Blindspot1Room = 28']), 'Sentry');
        const [name] = Object.values(byName);
        const [number] = Object.values(byNumber);
        expect(name.value).toBe(28);
        expect(number.value).toBe(28);
        expect(name.description?.[28]).toBe('Specimen Room'); // the registry label wins over the bare name
    });

    it('keeps the raw name of an unknown room, never NaN', () => {
        const [room] = Object.values(buildMiraRoleSettings(section('Sentry', ['Blindspot1Room = NewRoom']), 'Sentry'));
        expect(room.value).toBe('NewRoom');
    });

    it('reads the Amnesiac assassin options written with an interpolated locale key', () => {
        const s = buildMiraRoleSettings(
            section('Amnesiac', ['AmneTurnImpAssassin = IfAssassin', 'AmneTurnNeutAssassin = 2']),
            'Amnesiac',
        );
        const values = Object.values(s).map((x) => x.value);
        expect(values).toEqual([1, 2]);
        expect(canonicalEnumValue('TownOfUs.Options.Roles.Neutral.AmnesiacOptions', 'AmneTurnNeutAssassin', 'Always')).toBe('2');
    });

    it('shows the member name for an enum option that has no label', () => {
        const inv = Object.values(buildMiraRoleSettings(section('Investigator', ['FootprintMode = Distance']), 'Investigator'));
        const look = Object.values(buildMiraRoleSettings(section('Lookout', ['WatchType = Roles']), 'Lookout'));
        expect(inv).toHaveLength(1);
        expect(look).toHaveLength(1);
        for (const setting of [...inv, ...look]) {
            expect(typeof setting.value).toBe('number');
            expect(Object.values(setting.description ?? {})).toContain(
                setting === inv[0] ? 'Distance' : 'Roles',
            );
        }
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
