import { SettingTypes, type Setting } from '@/constants/settings';
import type { MiraSettingGroup } from './types';

export const MiraGeneral = {
    name: 'General',
    id: 'mira_general',
    cfgKey: 'General',
    settings: {
        'Impostors Don\'t Know Each Other': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Impostors Know Each Other\'s Roles': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Impostors Get A Private Meeting Chat': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Vampires Get A Private Meeting Chat': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Voting Time Added After Meeting Death': {
            value: 5,
            type: SettingTypes.Time,
        },
    } as Record<string, Setting>,
} satisfies MiraSettingGroup;
