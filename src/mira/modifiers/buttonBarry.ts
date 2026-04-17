import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraButtonBarryAbilities = {
    Button: {
        name: 'Button',
        icon: '/images/mira/abilities/BarryButton.png',
    },
};

export const MiraButtonBarry: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.UniversalModifier,
    name: 'Button Barry',
    id: 'mira_button_barry',
    color: '#e600ff',
    team: Teams.All,
    icon: '/images/mira/modifiers/ButtonBarry.png',
    description: 'Możesz nacisnąć przycisk z dowolnego miejsca na mapie, aby wywołać emergency meeting.',
    settings: {
        ...probabilityOfAppearing(0),
        'Button Cooldown': {
            value: 30,
            type: SettingTypes.Time,
        },
        'Max Uses': {
            value: 1,
            type: SettingTypes.Number,
        },
        'Ignore Sabotage': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'First Round Use': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraButtonBarryAbilities.Button],
};

