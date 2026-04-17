import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraVigilanteAbilities = {
    Guess: {
        name: 'Guess (Zgadnij rolę)',
        icon: '/images/mira/abilities/Guess.png',
    },
};

export const MiraVigilante: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Vigilante',
    id: 'mira_vigilante',
    color: '#FFFF99',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Vigilante.png',
    description: 'Vigilante może podczas spotkań zgadywać role złych frakcji. Poprawne trafienie zabija cel, a błędne może zabić Vigilante, jeśli nie ma już bezpiecznych strzałów.',
    settings: {
        ...probabilityOfAppearing(0),
        'Number of Guesses': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Can Guess More Than Once Per Meeting': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Guess Neutral Benign Roles': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Guess Neutral Evil Roles': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Guess Neutral Killing Roles': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Guess Neutral Outlier Roles': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Guess Killer Modifiers': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Guess Alliances': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Safe Shots Available': {
            value: 3,
            type: SettingTypes.Number,
        },
    },
    abilities: [MiraVigilanteAbilities.Guess],
};
