import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraCircumvent: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.ImpostorModifier,
    name: 'Circumvent',
    id: 'mira_circumvent',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/modifiers/Circumvent.png',
    description: 'Tracisz możliwość korzystania z ventów na mapie.',
    settings: {
        ...probabilityOfAppearing(0),
    },
    abilities: [MiraCommonAbilities.None],
};
