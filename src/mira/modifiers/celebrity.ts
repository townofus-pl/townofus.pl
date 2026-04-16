import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraCelebrity: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.CrewmateModifier,
    name: 'Celebrity',
    id: 'mira_celebrity',
    color: '#ff9999',
    team: Teams.Crewmate,
    icon: '/images/mira/modifiers/Celebrity.png',
    description: 'Po śmierci Celebrity na spotkaniu ujawniane są szczegóły zgonu: miejsce, czas i rola zabójcy.',
    settings: {
        ...probabilityOfAppearing(0),
    },
    abilities: [MiraCommonAbilities.None],
};

