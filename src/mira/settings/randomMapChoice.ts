import { SettingTypes, type Setting } from '@/constants/settings';

export const MiraRandomMapChoice = {
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
};
