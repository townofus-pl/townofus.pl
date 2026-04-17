import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraSleuth: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.UniversalModifier,
    name: 'Sleuth',
    id: 'mira_sleuth',
    color: '#803333',
    team: Teams.All,
    icon: '/images/mira/modifiers/Sleuth.png',
    description: 'Widzisz rolę ciał, które zgłaszasz.',
    settings: {
        ...probabilityOfAppearing(0),
    },
    abilities: [MiraCommonAbilities.None],
};
