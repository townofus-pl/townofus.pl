import { SettingTypes, type Setting } from '@/constants/settings';
import type { MiraSettingGroup } from './types';

export const MiraImpostorSettings = {
    name: 'Impostor Settings',
    id: 'mira_impostor_settings',
    cfgKey: 'RoleDraftImp',
    settings: {
        'Max Impostors Total': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Max Concealing Roles': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Max Killing Roles': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Max Power Roles': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Max Support Roles': {
            value: 2,
            type: SettingTypes.Number,
        },
    } as Record<string, Setting>,
} satisfies MiraSettingGroup;
