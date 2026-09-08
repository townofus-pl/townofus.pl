import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraDoubleShot: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.AssailantModifier,
    name: 'Double Shot',
    id: 'mira_double_shot',
    color: '#7e708f',
    team: Teams.Assailant,
    icon: '/images/mira/modifiers/DoubleShot.png',
    description: 'Dostajesz drugą próbę, gdy chybisz strzał na spotkaniu.',
    settings: {
        ...probabilityOfAppearing(0),
    },
    abilities: [MiraCommonAbilities.None],
};
