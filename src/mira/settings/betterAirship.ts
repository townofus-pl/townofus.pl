import { SettingTypes, type Setting } from '@/constants/settings';

export const MiraBetterAirship = {
    settings: {
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
        'Door Type on Airship': {
            value: 2,
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
        'Spawn Mode': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Normal',
                1: 'Everyone Has Same Spawns',
                2: 'Forced Spawn Location',
            },
        },
        'Spawn At': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                //TO DO: Add all spawn locations
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
        'Crash Course Sabotage Countdown': {
            value: 90,
            type: SettingTypes.Time,
        },
    } as Record<string, Setting>,
};
