import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraMultitasker: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.CrewmateModifier,
    name: 'Multitasker',
    id: 'mira_multitasker',
    color: '#ff804d',
    team: Teams.Crewmate,
    icon: '/images/mira/modifiers/Multitasker.png',
    description: 'Wszystkie menu są półprzezroczyste, dzięki czemu gracz widzi, co dzieje się za nimi.',
    settings: {
        ...probabilityOfAppearing(0),
    },
    abilities: [MiraCommonAbilities.None],
};

