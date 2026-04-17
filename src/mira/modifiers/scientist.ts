import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraScientist: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.CrewmateModifier,
    name: 'Scientist',
    id: 'mira_scientist_modifier',
    color: '#00C365',
    team: Teams.Crewmate,
    icon: '/images/mira/modifiers/Scientist.png',
    description: 'Scientist ma dostęp do Vitals zawsze i wszędzie, z limitem baterii.',
    settings: {
        ...probabilityOfAppearing(0),
        'Move With Vitals': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Starting Charge': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Round Charge': {
            value: 15,
            type: SettingTypes.Time,
        },
        'Task Charge': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Display Cooldown': {
            value: 15,
            type: SettingTypes.Time,
        },
        'Display Duration': {
            value: 15,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraCommonAbilities.None],
};

