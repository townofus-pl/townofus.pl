import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraSixthSense: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.UniversalModifier,
    name: 'Sixth Sense',
    id: 'mira_sixth_sense',
    color: '#d9ff8c',
    team: Teams.All,
    icon: '/images/mira/modifiers/SixthSense.png',
    description: 'Wiesz, kiedy ktoś wchodzi z Tobą w interakcję albo używa na Tobie zdolności.',
    settings: {
        ...probabilityOfAppearing(0),
    },
    abilities: [MiraCommonAbilities.None],
};

