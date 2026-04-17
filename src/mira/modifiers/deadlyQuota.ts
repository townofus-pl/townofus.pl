import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraDeadlyQuota: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.ImpostorModifier,
    name: 'Deadly Quota',
    id: 'mira_deadly_quota',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/modifiers/DeadlyQuota.png',
    description: 'Musisz osiągnąć limit zabójstw, inaczej przegrywasz nawet przy wygranej Impostorów.',
    settings: {
        ...probabilityOfAppearing(0),
        'Minimum Kill Quota': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Maximum Kill Quota': {
            value: 4,
            type: SettingTypes.Number,
        },
        'Temporary Shield Until Quota Is Met': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Remove Quota Upon Death': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.None],
};

