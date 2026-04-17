import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraSpyAbilities = {
    Admin: {
        name: 'Admin',
        icon: '/images/mira/abilities/AdminButton.png',
    },
};

export const MiraSpy: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Investigative,
    name: 'Spy',
    id: 'mira_spy',
    color: '#CCA3CC',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Spy.png',
    description: 'Spy zbiera dodatkowe informacje przez Admin. Widzi pozycje żywych graczy na mapie po kolorach i może dostać przenośny Admin z ładowaniem poprzez wykonanywanie tasków.',
    settings: {
        ...probabilityOfAppearing(0),
        'Who Sees Bodies On Admin': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Nobody',
                1: 'Spy',
                2: 'Everyone But Spy',
                3: 'Everyone',
            },
        },
        'Portable Admin': {
            value: 2,
            type: SettingTypes.Number,
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
    abilities: [MiraSpyAbilities.Admin],
    tip: 'Skupiaj się na monitorowaniu konkretnych grup graczy; przenośny Admin ładuj zadaniami i używaj go w kluczowych momentach rundy.',
};
