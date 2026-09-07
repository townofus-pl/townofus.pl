import { SettingTypes, type Setting } from '@/constants/settings';

export const MiraGameMechanics = {
    settings: {
        'Powerful Crew Continue The Game': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'All Shields Flash Grey On Trigger': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Cleaned/Dissolved Bodies Appear As': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Missing (MIS)',
                1: 'Dead (DED)',
                2: 'Disconnected (D/C)',
            },
        },
        'Kill Animation Background Color': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Red',
                1: 'Faction',
                2: 'Role Color',
            },
        },
        'Max Players Alive When Vents Disable': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Ghostwalkers Can Fix Sabotages': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Ghostwalkers That Auto-Vent On Spawn': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'None',
                1: 'Crewmates',
                2: 'Evils',
                3: 'All',
            },
        },
        'Temp Save Cooldown Reset': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Full Save Cooldown Multiplier': {
            value: 0.5,
            type: SettingTypes.Multiplier,
        },
    } as Record<string, Setting>,
};
