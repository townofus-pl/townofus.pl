import { SettingTypes, type Setting } from '@/constants/settings';

export const MiraRoundStartOptions = {
    settings: {
        'Modifier Type To Show In Role Intro': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'Alliance',
                1: 'Universal',
                2: 'Neither',          
            }
        },
        'Show Faction Modifier On Role Reveal': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Initial Button Cooldowns': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Initial Cooldowns Apply For': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'All Buttons',
                1: 'Specific Cooldowns',
                2: 'No Buttons',          
            }
        },
        'Minimum Cooldown To Be Applicable': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Maximum Cooldown To Be Applicable': {
            value: 60,
            type: SettingTypes.Time,
        },
        'First Death Shield Next Game': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Indicate Round One Victims': {
            value: true,
            type: SettingTypes.Boolean,
        },
    } as Record<string, Setting>,
};
