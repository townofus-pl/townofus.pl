import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraAmnesiacAbilities = {
    Remember: {
        name: 'Remember (Przypomnij sobie)',
        icon: '/images/mira/abilities/RememberButton.png',
    },
};

export const MiraAmnesiac: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Benign,
    name: 'Amnesiac',
    id: 'mira_amnesiac',
    color: '#80B3FF',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Amnesiac.png',
    description: 'Amnesiac nie ma własnego warunku zwycięstwa ani zadań. Może odnaleźć martwe ciało i przypomnieć sobie rolę zmarłego gracza, przejmując jej umiejętności oraz warunek zwycięstwa. Jeśli jest to rola unikatowa, otrzymuje zamiast niej podstawową rolę danej frakcji. Zależnie od ustawień może widzieć strzałki wskazujące martwe ciała.',
    settings: {
        ...probabilityOfAppearing(0),
        'Inherit Faction Modifiers': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Show Arrows Pointing To Dead Bodies': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Time After Death Arrow Appears': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Can be Impostor Assassin': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'Never',
                1: 'If Imp is Assassin',
                2: 'Always',
            },
        },
        'Can be Neutral Killing Assassin': {
            value: 2,
            type: SettingTypes.Number,
            description: {
                0: 'Never',
                1: 'If NK is Assassin',
                2: 'Always',
            },
        },
    },
    abilities: [MiraAmnesiacAbilities.Remember],
};

