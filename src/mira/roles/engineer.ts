import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraEngineerAbilities = {
    Fix: {
        name: 'Fix (Napraw)',
        icon: '/images/mira/abilities/FixButton.png',
    },
    Vent: {
        name: 'Vent (Wentylacja)',
        icon: '/images/mira/abilities/EngiVentButton.png',
    },
};

export const MiraEngineer: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Support,
    name: 'Engineer',
    id: 'mira_engineer',
    color: '#FFA60A',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Engineer.png',
    description: 'Engineer może korzystać z wentów oraz zdalnie naprawiać aktywne sabotaże.',
    settings: {
        ...probabilityOfAppearing(0),
        'Vent Uses Per Game': {
            value: 30,
            type: SettingTypes.Number,
        },
        'Earn More Vent Uses From Completing Tasks': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Vent Cooldown': {
            value: 15,
            type: SettingTypes.Time,
        },
        'Vent Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Fixes Per Game': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Fix Delay': {
            value: 0.5,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraEngineerAbilities.Fix, MiraEngineerAbilities.Vent],
};
