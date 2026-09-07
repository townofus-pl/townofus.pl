import { SettingTypes, type Setting } from '@/constants/settings';

export const MiraBetterSkeld = {
    settings: {
        'Camouflage Comms': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Speed Multiplier': {
            value: 1,
            type: SettingTypes.Multiplier,
        },
        'Crew Vison Multiplier': {
            value: 1,
            type: SettingTypes.Multiplier,
        },
        'Impostor Vision Multiplier': {
            value: 1,
            type: SettingTypes.Multiplier,
        },
        'Cooldown Offset': {
            value: 0,
            type: SettingTypes.Time,
        },
        'Short Tasks Offset': {
            value: 0,
            type: SettingTypes.Number,
        },
        'Long Tasks Offset': {
            value: 0,
            type: SettingTypes.Number,
        },
        'Door Type on Skeld': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Skeld',
                1: 'Polus',
                2: 'Airship',
                3: 'Fungle',
                4: 'Submerged',
                5: 'No Doors',
                6: 'Random',
            },
        },
        'Skeld Vent Network': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Unchanged',
                1: 'Quad-group',
            },
        },
        'Themed Map Decor': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Automatic',
                1: 'No Decor',
                2: 'Halloween',
            },
        },
        'Change Sabotage Timers': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Oxygen Sabotage Countdown': {
            value: 30,
            type: SettingTypes.Time,
        },
        'Reactor Sabotage Duration': {
            value: 30,
            type: SettingTypes.Time,
        },
    } as Record<string, Setting>,
};
