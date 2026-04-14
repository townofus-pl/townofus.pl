import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraVeteranAbilities = {
    Alert: {
        name: 'Alert (Alarm)',
        icon: '/images/mira/abilities/AlertButton.png',
    },
};

export const MiraVeteran: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Veteran',
    id: 'mira_veteran',
    color: '#998040',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Veteran.png',
    description: 'Veteran może wejść w tryb Alert i zabija każdego, kto z nim wejdzie w interakcję (z wyjątkami wynikającymi z ustawień i statusów ochronnych).',
    settings: {
        ...probabilityOfAppearing(0),
        'Alert Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Alert Duration': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Max Number of Alerts': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Can Be Killed On Alert': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Get More Uses From Completing Tasks': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraVeteranAbilities.Alert],
};
