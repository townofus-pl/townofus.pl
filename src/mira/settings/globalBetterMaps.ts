import { SettingTypes, type Setting } from '@/constants/settings';
import type { MiraSettingGroup } from './types';

export const MiraGlobalBetterMaps = {
    name: 'Global Better Maps',
    id: 'mira_global_better_maps',
    cfgKey: 'GlobalBetterMap',
    settings: {
        'Use Camouflage Comms': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Globally Disabled',
                1: 'Globally Enabled',
                2: 'Per Map Change'
            },
        },
        'Change Speed Multiplier': {
            value: 2,
            type: SettingTypes.Number,
            description: {
                0: 'Globally Disabled',
                1: 'Globally Enabled',
                2: 'Per Map Change'
            },
        },
        'Change Crew Vision Multiplier': {
            value: 2,
            type: SettingTypes.Number,
            description: {
                0: 'Globally Disabled',
                1: 'Globally Enabled',
                2: 'Per Map Change'
            },
        },
        'Change Impostor Vision Multiplier': {
            value: 2,
            type: SettingTypes.Number,
            description: {
                0: 'Globally Disabled',
                1: 'Globally Enabled',
                2: 'Per Map Change'
            },
        },
        'Change Cooldown Offset': {
            value: 2,
            type: SettingTypes.Number,
            description: {
                0: 'Globally Disabled',
                1: 'Globally Enabled',
                2: 'Per Map Change'
            },
        },
        'Change Short Tasks Offset': {
            value: 2,
            type: SettingTypes.Number,
            description: {
                0: 'Globally Disabled',
                1: 'Globally Enabled',
                2: 'Per Map Change'
            },
        },
        'Change Long Tasks Offset': {
            value: 2,
            type: SettingTypes.Number,
            description: {
                0: 'Globally Disabled',
                1: 'Globally Enabled',
                2: 'Per Map Change'
            },
        },
        'Speed Multiplier': {
            value: 1,
            type: SettingTypes.Multiplier,
        },
        'Crew Vision Multiplier': {
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
    } as Record<string, Setting>,
} satisfies MiraSettingGroup;
