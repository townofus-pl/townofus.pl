import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraFairyAbilities = {
    Protect: {
        name: 'Protect (Chron)',
        icon: '/images/mira/abilities/ProtectButton.png',
    },
};

export const MiraFairy: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Benign,
    name: 'Fairy',
    id: 'mira_fairy',
    color: '#B3FFFF',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Fairy.png',
    description: 'Fairy musi chronić swój cel przed śmiercią lub wyrzuceniem i wygrywa, jeśli cel wygra.',
    settings: {
        ...probabilityOfAppearing(0),
        'Protect Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Protect Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Max Number of Protect': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Show Protected Player': {
            value: 'Target + GA',
            type: SettingTypes.Text,
            description: {
                0: 'Target',
                1: 'Target + GA',
                2: 'Everyone',
            },
        },
        'On Target Death, GA Becomes': {
            value: 'Amnesiac',
            type: SettingTypes.Text,
            description: {
                0: 'Amnesiac',
                1: 'Survivor',
                2: 'Mercenary',
                3: 'Jester',
                4: 'Crewmate',
            },
        },
        'Target Knows GA Exists': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'GA Knows Target Roles': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Odds of Target Being Evil': {
            value: 20,
            type: SettingTypes.Percentage,
        },
    },
    abilities: [MiraFairyAbilities.Protect],
};

