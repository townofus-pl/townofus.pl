import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraVampireAbilities = {
    Bite: {
        name: 'Bite (Ugryz)',
        icon: '/images/mira/abilities/BiteButton.png',
    },
    Vent: {
        name: 'Vent (Wentylacja)',
        icon: '/images/mira/abilities/VampVentButton.png',
    },
};

export const MiraVampire: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Vampire',
    id: 'mira_vampire',
    color: '#A32929',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Vampire.png',
    description: 'Vampire wygrywa jako ostatni zabójca lub ostatnia drużyna. Może gryźć graczy, by ich konwertować albo zabijać.',
    settings: {
        ...probabilityOfAppearing(0),
        'Bite Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Max Number Of Vampires Per Game': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Vampires Have Impostor Vision': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'New Vampires Can Assassinate': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Convert Neutral Benign Roles': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Convert Neutral Evil Roles': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Convert Neutral Outlier Roles': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Can Convert Lovers': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'New Vampires Can Convert': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Vampires Can Vent': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraVampireAbilities.Bite, MiraVampireAbilities.Vent],
};

