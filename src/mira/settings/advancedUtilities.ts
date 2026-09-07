import { SettingTypes, type Setting } from '@/constants/settings';

export const MiraAdvancedUtilities = {
    settings: {
        'Tasks Required to Use Admin Table': {
            value: 1,
            type: SettingTypes.Number,
        },
        'Tasks Required to Use Cams': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Tasks Required to Use Doorlog': {
            value: 0,
            type: SettingTypes.Number,
        },
        'Tasks Required to Use Vitals': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Tasks Are Checked On Portable Utils': {
            value: true,
            type: SettingTypes.Boolean,
        }
    } as Record<string, Setting>,
};
