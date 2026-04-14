import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraAftermath: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.CrewmateModifier,
    name: 'Aftermath',
    id: 'mira_aftermath',
    color: '#A6FFA6',
    team: Teams.Crewmate,
    icon: '/images/mira/modifiers/Aftermath.png',
    description: 'Po śmierci Aftermath zabójca zostaje zmuszony do użycia swoich umiejętności, celując w ciało albo siebie.',
    settings: {
        ...probabilityOfAppearing(0),
    },
    abilities: [MiraCommonAbilities.None],
};

