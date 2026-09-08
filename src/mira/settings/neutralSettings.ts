import { SettingTypes, type Setting } from '@/constants/settings';
import type { MiraSettingGroup } from './types';

export const MiraNeutralSettings = {
    name: 'Neutral Settings',
    id: 'mira_neutral_settings',
    cfgKey: 'RoleDraftNeut',
    settings: {
        'Max Neutrals Total': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Max Benign Roles': {
            value: 0,
            type: SettingTypes.Number,
        },
        'Max Evil Roles': {
            value: 1,
            type: SettingTypes.Number,
        },
        'Max Killing Roles': {
            value: 1,
            type: SettingTypes.Number,
        },
        'Max Outlier Roles': {
            value: 0,
            type: SettingTypes.Number,
        },
    } as Record<string, Setting>,
} satisfies MiraSettingGroup;
