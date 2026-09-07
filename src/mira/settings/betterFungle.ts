import { SettingTypes, type Setting } from '@/constants/settings';

export const MiraBetterFungle = {
    settings: {
        'Camouflage Comms': {
            value: false,
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
        'Door Type on Fungle': {
            value: 3,
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
        'No Ladder Cooldown': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Change Sabotage Timers': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Reactor Sabotage Countdown': {
            value: 90,
            type: SettingTypes.Time,
        },
        'Mix-Up Sabotage Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
    } as Record<string, Setting>,
};
