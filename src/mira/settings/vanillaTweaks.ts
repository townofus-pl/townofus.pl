import { SettingTypes, type Setting } from '@/constants/settings';

export const MiraVanillaTweaks = {
    settings: {
        'Continue Cooldowns In Tasks And Panels': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Parallel Medbay Scans': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Walk to Medscan': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Disable Meeting Skip Button': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Never',
                1: 'Emergency',
                2: 'Always',          
            }
        },
        'Hide Vent Animations Not In Vision': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Pet Visibility': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'Client Side',
                1: 'When Alive',
                2: 'Always Visible',          
            }
        },
        'Pet Removed on Body Clean': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'Never',
                1: 'During Round',
                2: 'Always',          
            }
        },    
    } as Record<string, Setting>,
};
