import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraMediumAbilities = {
    Mediate: {
        name: 'Mediate (Medytuj)',
        icon: '/images/mira/abilities/MediateButton.png',
    },
};

export const MiraMedium: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Investigative,
    name: 'Medium',
    id: 'mira_medium',
    color: '#A680FF',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Medium.png',
    description: 'Medium może tymczasowo stać się duchem używając zdolności Mediate. Podczas medytacji ciało Medium pozostaje bezbronne, a duch może przechodzić przez ściany i widzieć inne duchy. Po upływie czasu duch wraca do ciała.',
    settings: {
        ...probabilityOfAppearing(0),
        'Mediate Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Mediate Duration': {
            value: 15,
            type: SettingTypes.Time,
        },
        'Spirit Speed When Mediating': {
            value: 3.5,
            type: SettingTypes.Multiplier,
        },
        'Time Before Spirit is Visible to Others': {
            value: 2.5,
            type: SettingTypes.Time,
        },
        'Medium Can Identify': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Nobody',
                1: 'Living',
                2: 'Ghosts',
                3: 'Living + Ghosts',
            },
        },
        'Arrow Visibility': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Medium',
                1: 'Mediated',
                2: 'Neither',
            },
        },
        'Who is Revealed': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Oldest Dead',
                1: 'Newest Dead',
                2: 'Random Dead',
                3: 'All Dead',
            },
        },
    },
    abilities: [MiraMediumAbilities.Mediate],
    tip: 'Medytację uruchamiaj wtedy, gdy drużyna ma już kontrolę nad sytuacją, bo ciało Medium pozostaje bezbronne i łatwo je wtedy wyeliminować.',
};
