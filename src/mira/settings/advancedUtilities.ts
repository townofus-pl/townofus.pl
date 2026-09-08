import { SettingTypes, type Setting } from '@/constants/settings';
import type { MiraSettingGroup } from './types';

export const MiraAdvancedUtilities = {
    name: 'Advanced Utilities',
    id: 'mira_advanced_utilities',
    cfgKey: 'AdvancedUtility',
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
} satisfies MiraSettingGroup;
