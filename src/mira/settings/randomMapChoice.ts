import { SettingTypes, type Setting } from '@/constants/settings';
import type { MiraSettingGroup } from './types';

export const MiraRandomMapChoice = {
    name: 'Random Map Choice',
    id: 'mira_random_map_choice',
    cfgKey: 'TownOfUsMap',
    settings: {
        'Enable Randomized Map': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Skeld Chance': {
            value: 0,
            type: SettingTypes.Percentage,
        },
        'dlekS ecnahC': {
            value: 0,
            type: SettingTypes.Percentage,
        },
        'Mira HQ Chance': {
            value: 0,
            type: SettingTypes.Percentage,
        },
        'Polus Chance': {
            value: 0,
            type: SettingTypes.Percentage,
        },
        'Airship Chance': {
            value: 0,
            type: SettingTypes.Percentage,
        },
        'Fungle Chance': {
            value: 0,
            type: SettingTypes.Percentage,
        },
        'Submerged Chance': {
            value: 0,
            type: SettingTypes.Percentage,
        },
        'Level Impostor Chance': {
            value: 0,
            type: SettingTypes.Percentage,
        },
    } as Record<string, Setting>,
} satisfies MiraSettingGroup;
