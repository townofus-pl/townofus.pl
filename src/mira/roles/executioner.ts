import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraExecutionerAbilities = {
    Torment: {
        name: 'Torment (Udrecz)',
        icon: '/images/mira/abilities/ExeTormentButton.png',
    },
};

export const MiraExecutioner: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Evil,
    name: 'Executioner',
    id: 'mira_executioner',
    color: '#633B1F',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Executioner.png',
    description: 'Executioner wygrywa, gdy jego cel zostanie wyrzucony na spotkaniu. Jeżeli ustawiono odpowiednią opcję: Po wygranej Executioner może zabić jedną z osób, które zagłosowały na jego cel.',
    settings: {
        ...probabilityOfAppearing(0),
        'On Target Death. Executioner Becomes': {
            value: 4,
            type: SettingTypes.Number,
            description: {
                0: 'Crewmate',
                1: 'Amnesiac',
                2: 'Survivor',
                3: 'Mercenary',
                4: 'Jester',
            },
        },
        'Executioner Can Button': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Executioner Win': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'Ends Game',
                1: 'Leaves & Torments',
                2: 'Nothing',
            },
        },
        'Hide Role On Win Notification': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraExecutionerAbilities.Torment],
};
