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
        'Max Number Of Protects': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Show Protected Player': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'Fairy',
                1: 'Fairy + Target',
                2: 'Everyone',
            },
        },
        'On Target Death, Fairy Becomes': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'Crewmate',
                1: 'Amnesiac',
                2: 'Survivor',
                3: 'Mercenary',
                4: 'Jester',
            },
        },
        'Target Knows Fairy Exists': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Fairy Knows Target’s Role': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Odds Of Target Being Evil': {
            value: 20,
            type: SettingTypes.Number,
        },
    },
    abilities: [MiraFairyAbilities.Protect],
};

