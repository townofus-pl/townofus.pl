import { SettingTypes, type Setting } from '@/constants/settings';

export const MiraNeutralSettings = {
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
};
