import { SettingTypes, type Setting } from '@/constants/settings';

const roleListOptions = {
    0: 'NonImp, Any',
    1: 'CrewInvest, CrewKilling, CrewProtective, CrewPower, CrewSupport, CrewCommon, CrewSpecial, CrewRandom',
    2: 'NeutBenign, NeutEvil, NeutKilling, NeutOutlier, NeutCommon, NeutSpecial, NeutWildcard, NeutRandom',
    3: 'ImpConceal, ImpKilling, ImpPower, ImpSupport, ImpCommon, ImpSpecial, ImpRandom',
};

export const MiraRoleListSettings = {
    settings: {
        'Slot 1': {
            value: 'CrewCommon',
            type: SettingTypes.Text,
            description: roleListOptions,
        },
        'Slot 2': {
            value: 'CrewCommon',
            type: SettingTypes.Text,
            description: roleListOptions,
        },
        'Slot 3': {
            value: 'CrewCommon',
            type: SettingTypes.Text,
            description: roleListOptions,
        },
        'Slot 4': {
            value: 'ImpCommon',
            type: SettingTypes.Text,
            description: roleListOptions,
        },
        'Slot 5': {
            value: 'CrewCommon',
            type: SettingTypes.Text,
            description: roleListOptions,
        },
        'Slot 6': {
            value: 'CrewCommon',
            type: SettingTypes.Text,
            description: roleListOptions,
        },
        'Slot 7': {
            value: 'CrewCommon',
            type: SettingTypes.Text,
            description: roleListOptions,
        },
        'Slot 8': {
            value: 'CrewCommon',
            type: SettingTypes.Text,
            description: roleListOptions,
        },
        'Slot 9': {
            value: 'ImpCommon',
            type: SettingTypes.Text,
            description: roleListOptions,
        },
        'Slot 10': {
            value: 'CrewCommon',
            type: SettingTypes.Text,
            description: roleListOptions,
        },
        'Slot 11': {
            value: 'CrewCommon',
            type: SettingTypes.Text,
            description: roleListOptions,
        },
        'Slot 12': {
            value: 'CrewCommon',
            type: SettingTypes.Text,
            description: roleListOptions,
        },
        'Slot 13': {
            value: 'CrewCommon',
            type: SettingTypes.Text,
            description: roleListOptions,
        },
        'Slot 14': {
            value: 'ImpCommon',
            type: SettingTypes.Text,
            description: roleListOptions,
        },
        'Slot 15': {
            value: 'CrewCommon',
            type: SettingTypes.Text,
            description: roleListOptions,
        },
    } satisfies Record<string, Setting>,
};
