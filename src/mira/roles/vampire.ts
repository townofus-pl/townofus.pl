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
        'Max Number of Vampires Per Game': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Vampires Have Impostor Vision': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'New Vampire Can Assassinate': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Valid Conversions': {
            value: 'Crew, Neutral Benign & Neutral Evils',
            type: SettingTypes.Text,
            description: {
                0: 'Crew, Neutral Benign & Neutral Evils',
                1: 'Crew & Lovers',
                2: 'Crew, Lovers & NBs',
                3: 'Crew, Lovers & NEs',
                4: 'Crew, Lovers, NBs & NEs',
                5: 'Crewmates',
                6: 'Crew & NBs',
                7: 'Crew & NEs',
            },
        },
        'Vampire Can Vent': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraVampireAbilities.Bite, MiraVampireAbilities.Vent],
};

