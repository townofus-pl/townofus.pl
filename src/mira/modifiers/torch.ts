import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraTorch: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.CrewmateModifier,
    name: 'Torch',
    id: 'mira_torch',
    color: '#fdfd98',
    team: Teams.Crewmate,
    icon: '/images/mira/modifiers/Torch.png',
    description: 'Zgaszone światła nie wpływają na pole widzenia Torch.',
    settings: {
        ...probabilityOfAppearing(0),
    },
    abilities: [MiraCommonAbilities.None],
};

