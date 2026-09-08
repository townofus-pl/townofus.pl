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
        name: 'Vent (Wejdź do wentylacji)',
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
            value: -1,
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
        'Fix Uses Per Game': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Tasks Required For Additional Fix Use': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'Off',
            },
        },
        'Fix Delay': {
            value: 0.5,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraEngineerAbilities.Vent, MiraEngineerAbilities.Fix],
};
