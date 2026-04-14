import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '@/mira/abilities';

export const MiraInvestigator: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Investigative,
    name: 'Investigator',
    id: 'mira_investigator',
    color: '#00B3B3',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Investigator.png',
    description: 'Investigator widzi odciski stóp innych graczy w trakcie rundy, co pomaga śledzić ich ruchy i alibi. Uwaga: odciski stóp Swoopera są ukryte.',
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
    tip: 'Podążaj za śladami graczy, których podejrzewasz, ale trzymaj dystans, aby nie zdradzać swojej pozycji i łatwiej wychwycić venterów.',
};
