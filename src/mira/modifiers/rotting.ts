import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraRotting: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.CrewmateModifier,
    name: 'Rotting',
    id: 'mira_rotting',
    color: '#A97F68',
    team: Teams.Crewmate,
    icon: '/images/mira/modifiers/Rotting.png',
    description: 'Po ustawionym czasie ciało gracza znika, przez co nie da się go zgłosić.',
    settings: {
        ...probabilityOfAppearing(0),
        'Rot Delay': {
            value: 5,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraCommonAbilities.None],
};

