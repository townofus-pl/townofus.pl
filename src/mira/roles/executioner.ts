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
        'On Target Death, Executioner Becomes': {
            value: 'Jester',
            type: SettingTypes.Text,
            description: {
                0: 'Jester',
                1: 'Crew',
                2: 'Amnesiac',
                3: 'Survivor',
                4: 'Mercenary',
            },
        },
        'Executioner Can Button': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Executioner Win': {
            value: 'Leaves & Torments',
            type: SettingTypes.Text,
            description: {
                0: 'Leaves & Torments',
                1: 'Ends Game',
                2: 'Nothing',
            },
        },
    },
    abilities: [MiraExecutionerAbilities.Torment],
};
