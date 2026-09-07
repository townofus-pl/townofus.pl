import { SettingTypes, type Setting } from '@/constants/settings';

export const MiraRoleblockMechanics = {
    settings: {
        'Roleblock Affects Non-Role Actions': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Roleblock Duration': {
            value: 15,
            type: SettingTypes.Time,
        },
        'Invert Controls Of Roleblocked': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Grant Hangover': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Hangover Duration': {
            value: 30,
            type: SettingTypes.Time,
        },
    } as Record<string, Setting>,
};
