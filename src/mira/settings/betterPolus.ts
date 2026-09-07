import { SettingTypes, type Setting } from '@/constants/settings';

export const MiraBetterPolus = {
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
        'Door Type on Polus': {
            value: 1,
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
        'Adjusted Polus Vent Network': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Vitals Moved To Lab': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Cold Temp Moved To Death Valley': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Reboot Wifi And Chart Course Swapped': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Move Bathroom Vent Outside the Stalls': {
            value: false,
            type: SettingTypes.Boolean,
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
        'Seismic Stabilizer Sabotage Countdown': {
            value: 60,
            type: SettingTypes.Time,
        },
    } as Record<string, Setting>,
};
