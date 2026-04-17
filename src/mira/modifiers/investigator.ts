import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraInvestigatorModifier: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.CrewmateModifier,
    name: 'Investigator',
    id: 'mira_modifier_investigator',
    color: '#00B3B3',
    team: Teams.Crewmate,
    icon: '/images/mira/modifiers/Investigator.png',
    description: 'Investigator widzi odciski stóp graczy podczas rundy. Odciski Swoopera są ukryte.',
    settings: {
        ...probabilityOfAppearing(0),
        'Footprint Size': {
            value: 4,
            type: SettingTypes.Multiplier,
        },
        'Footprint Interval': {
            value: 1,
            type: SettingTypes.Time,
        },
        'Footprint Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Anonymous Footprints': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Show Vent Footprints': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.None],
};
