import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraSpyModifierAbilities = {
    Admin: {
        name: 'Admin',
        icon: '/images/mira/abilities/AdminButton.png',
    },
};

export const MiraSpyModifier: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.CrewmateModifier,
    name: 'Spy',
    id: 'mira_spy_modifier',
    color: '#CCA3CC',
    team: Teams.Crewmate,
    icon: '/images/mira/modifiers/Spy.png',
    description: 'Spy dostaje rozszerzone informacje na Adminie i może korzystać z przenośnego Admina z limitem baterii.',
    settings: {
        ...probabilityOfAppearing(0),
        'Who Sees Bodies On Admin': {
            value: 'Nobody',
            type: SettingTypes.Text,
            description: {
                0: 'Nobody',
                1: 'Spy',
                2: 'Everyone But Spy',
                3: 'Everyone',
            },
        },
        'Portable Admin': {
            value: 'Both',
            type: SettingTypes.Text,
            description: {
                0: 'Role',
                1: 'Modifier',
                2: 'Both',
                3: 'Neither',
            },
        },
        'Move With Portable Admin': {
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
    abilities: [MiraSpyModifierAbilities.Admin],
};

