import { SettingTypes, type Setting } from '@/constants/settings';
import type { MiraSettingGroup } from './types';

export const MiraBetterMiraHq = {
    name: 'Better Mira HQ',
    id: 'mira_better_mira_hq',
    cfgKey: 'BetterMiraHq',
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
        'Mira HQ Vent Network': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Interconnected',
                1: 'Tri-group',
                2: 'Quad-group',
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
            value: 45,
            type: SettingTypes.Time,
        },
        'Reactor Sabotage Countdown': {
            value: 45,
            type: SettingTypes.Time,
        },
    } as Record<string, Setting>,
} satisfies MiraSettingGroup;
