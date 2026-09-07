import { SettingTypes, type Setting } from '@/constants/settings';

export const MiraAdvancedSabotages = {
    settings: {
        'Kill Anyone During Camouflage': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Camouflage Kill Screens During Comms': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Camouflage Hides Player Size': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Camouflage Hides Player Speed': {
            value: false,
            type: SettingTypes.Boolean,
        },
    } as Record<string, Setting>,
};
