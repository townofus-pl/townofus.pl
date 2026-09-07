import { SettingTypes, type Setting } from '@/constants/settings';

const RecapOptions = {
    0: 'Nothing, Faction, Alignment, Role',
};

const roleListOptions = {
    0: 'NonImp, Any',
    1: 'CrewInvest, CrewKilling, CrewProtective, CrewPower, CrewSupport, CrewCommon, CrewSpecial, CrewRandom',
    2: 'NeutBenign, NeutEvil, NeutKilling, NeutOutlier, NeutCommon, NeutSpecial, NeutWildcard, NeutRandom',
    3: 'ImpConceal, ImpKilling, ImpPower, ImpSupport, ImpCommon, ImpSpecial, ImpRandom',
};

export const MiraRoleSettings = {
    settings: {
        'Role Assignment Type': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'Vanilla',
                1: 'Role List',
                2: 'Min/Max List',
                3: 'Draft',        
            }
        },
        'Reduce Impostor Streak': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Reduction Chance': {
            value: 15,
            type: SettingTypes.Percentage,
        },
        'Draft Recap Displays': {
            value: 'Faction',
            type: SettingTypes.Text,
            description: RecapOptions,
        },
        'Draft Sidebar Displays': {
            value: 'Faction',
            type: SettingTypes.Text,
            description: RecapOptions,
        },
        'Use Role List For Pool': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Offered Role Picks Per Turn': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Show Random Role Pick': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Turn Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Concurrent Picks Per Turn': {
            value: 1,
            type: SettingTypes.Number,
        },
        'Shuffles Per Player': {
            value: 1,
            type: SettingTypes.Number,
        },
        'Min Neutral Benign': {
            value: 0,
            type: SettingTypes.Number,
        },
        'Max Neutral Benign': {
            value: 0,
            type: SettingTypes.Number,
        },
        'Min Neutral Evil': {
            value: 0,
            type: SettingTypes.Number,
        },
        'Max Neutral Evil': {
            value: 0,
            type: SettingTypes.Number,
        },
        'Min Neutral Killer': {
            value: 0,
            type: SettingTypes.Number,
        },
        'Max Neutral Killer': {
            value: 0,
            type: SettingTypes.Number,
        },
        'Min Neutral Outliers': {
            value: 0,
            type: SettingTypes.Number,
        },
        'Max Neutral Outliers': {
            value: 0,
            type: SettingTypes.Number,
        },
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
    } as Record<string, Setting>,
};
