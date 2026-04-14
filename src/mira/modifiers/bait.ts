import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraBait: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.CrewmateModifier,
    name: 'Bait',
    id: 'mira_bait',
    color: '#33b3b3',
    team: Teams.Crewmate,
    icon: '/images/mira/modifiers/Bait.png',
    description: 'Po śmierci Bait zabójca automatycznie zgłasza ciało.',
    settings: {
        ...probabilityOfAppearing(0),
        'Min Delay': {
            value: 0,
            type: SettingTypes.Time,
        },
        'Max Delay': {
            value: 1,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraCommonAbilities.None],
};

