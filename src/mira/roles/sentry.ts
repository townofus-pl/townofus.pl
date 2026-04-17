import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraSentryAbilities = {
    Deploy: {
        name: 'Deploy (Rozstaw)',
        icon: '/images/mira/abilities/DeployButton.png',
    },
    View: {
        name: 'View (Podgląd)',
        icon: '/images/mira/abilities/CamButton.png',
    },
};

export const MiraSentry: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Support,
    name: 'Sentry',
    id: 'mira_sentry',
    color: '#6496C8',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Sentry.png',
    description: 'Sentry może stawiać dodatkowe kamery na mapie, a następnie oglądać je z Security lub przez przenośne kamery.',
    settings: {
        ...probabilityOfAppearing(0),
        'Placement Cooldown': {
            value: 30,
            type: SettingTypes.Time,
        },
        'Deployed Cameras Visibility': {
            value: 'Immediately',
            type: SettingTypes.Text,
            description: {
                0: 'Immediately',
                1: 'After Meeting',
            },
        },
        'Can Move While Placing Cameras': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Portable Cameras': {
            value: 'After Tasks',
            type: SettingTypes.Text,
            description: {
                0: 'After Tasks',
                1: 'Immediately',
                2: 'On Maps Without Cameras',
            },
        },
        'Initial Cameras': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Amount Of Rounds Cameras Last': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Tasks Required Per Camera': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Max Cameras Placed At Once': {
            value: 4,
            type: SettingTypes.Number,
        },
        'Portable Cameras Battery': {
            value: 90,
            type: SettingTypes.Time,
        },
        'Blind Spots': {
            value: 'Off',
            type: SettingTypes.Text,
            description: {
                0: 'Off',
                1: '1',
                2: '2',
                3: '3',
                4: '4',
                5: '5',
                6: '6',
                7: '7',
                8: '8',
                9: '9',
                10: '10',
            },
        },
    },
    abilities: [MiraSentryAbilities.Deploy, MiraSentryAbilities.View],
};
