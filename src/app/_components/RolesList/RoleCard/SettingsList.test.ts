import { getValue } from './SettingsList';
import { SettingTypes } from '@/constants/settings';
import { populateMira } from '@/app/dramaafera/_utils/settingsView';

describe('setting descriptions', () => {
    it.each([
        SettingTypes.Number,
        SettingTypes.Percentage,
        SettingTypes.Time,
        SettingTypes.Multiplier,
    ])('prefers descriptions over numeric formatting for %s', (type) => {
        expect(getValue({ type, value: 2, description: { 2: 'Opis wartości' } })).toBe('Opis wartości');
    });

    it('shows Sentry blindspot room names and Off for zero blindspots', () => {
        const view = populateMira(`[Roles]
Chance TownOfUs.Roles.Crewmate.SentryRole = 100
[TownOfUs.Options.Roles.Crewmate.SentryOptions]
BlindspotsCount = 0
Blindspot1Room = 28
Blindspot2Room = 27
PortableCamerasMode = 0
`);
        const sentry = view.roles.find((role) => role.name === 'Sentry')!;
        expect(getValue(sentry.settings['Blind Spots'])).toBe('Off');
        expect(getValue(sentry.settings['Blindspot 1 Room'])).toBe('Specimen Room');
        expect(getValue(sentry.settings['Blindspot 2 Room'])).toBe('Outside');
        expect(getValue(sentry.settings['Instant Portable Cameras (or After Tasks)'])).toBe('Always');
    });

    it('shows the description for numeric values, including zero', () => {
        expect(getValue({ type: SettingTypes.Number, value: 0, description: { 0: 'Self' } })).toBe('Self');
        expect(getValue({ type: SettingTypes.Text, value: '2', description: { 2: 'Everyone But Spy' } }))
            .toBe('Everyone But Spy');
    });

    it('does not truncate unknown values to a different described option', () => {
        expect(getValue({ type: SettingTypes.Number, value: 1.5, description: { 1: 'Spy' } })).toBe('1.5');
        expect(getValue({ type: SettingTypes.Text, value: '1unknown', description: { 1: 'Spy' } })).toBe('1unknown');
    });

    it('preserves enum descriptions from the uploaded settings through to display', () => {
        const view = populateMira(`[Roles]
Chance TownOfUs.Roles.Crewmate.AltruistRole = 100
[TownOfUs.Options.Roles.Crewmate.AltruistOptions]
ReviveMode = 2
[TownOfUs.Options.Modifiers.CrewmateModifierOptions]
SpyChance = 100
[TownOfUs.Options.Modifiers.Crewmate.SpyOptions]
WhoSeesDead = 2
HasPortableAdmin = 0
`);
        const altruist = view.roles.find((role) => role.name === 'Altruist')!;
        expect(getValue(altruist.settings['Revive Type'])).toBe('Group Revive');
        const spy = view.modifiers.find((modifier) => modifier.name === 'Spy')!;
        const settings = Object.values(spy.settings).filter((setting) => setting.description);
        expect(settings).toHaveLength(2);
        expect(settings.map(getValue)).toEqual(['Everyone But Spy', 'Role']);
    });
});
