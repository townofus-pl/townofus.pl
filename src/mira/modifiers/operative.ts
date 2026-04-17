import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraOperative: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.CrewmateModifier,
    name: 'Operative',
    id: 'mira_operative',
    color: '#940816',
    team: Teams.Crewmate,
    icon: '/images/mira/modifiers/Operative.png',
    description: 'Operative może używać kamer zawsze i wszędzie, ale z ograniczoną baterią.',
    settings: {
        ...probabilityOfAppearing(0),
        'Move On Mira': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Starting Charge': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Round Charge': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Task Charge': {
            value: 7.5,
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

