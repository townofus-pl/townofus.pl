import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraImmovable: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.UniversalModifier,
    name: 'Immovable',
    id: 'mira_immovable',
    color: '#e6e6cc',
    team: Teams.All,
    icon: '/images/mira/modifiers/Immovable.png',
    description: 'Nie możesz zostać przeteleportowany na spotkanie i nie działają na Ciebie teleporty ani disperse.',
    settings: {
        ...probabilityOfAppearing(0),
    },
    abilities: [MiraCommonAbilities.None],
};

