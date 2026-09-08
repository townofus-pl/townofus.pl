import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import { MiraCommonAbilities } from '../abilities';

export const MiraSwooperAbilities = {
    Swoop: {
        name: 'Swoop (Zniknij)',
        icon: '/images/mira/abilities/SwoopButton.png',
    },
    Unswoop: {
        name: 'Unswoop (Przywróć widoczność)',
        icon: '/images/mira/abilities/UnswoopButton.png',
    },
};

export const MiraSwooper: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Concealing,
    name: 'Swooper',
    id: 'mira_swooper',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Swooper.png',
    description: 'Swooper może chwilowo stać się niewidzialny.',
    settings: {
        ...probabilityOfAppearing(0),
        'Swoop Uses Per Round': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: '∞',
            },
        },
        'Swoop Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Swoop Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Can be Tracked while Invisible': {
            value: 2,
            type: SettingTypes.Number,
            description: {
                0: 'Never',
                1: 'Not by Radar',
                2: 'Always',
            },
        },
        'Swooper Can Vent': {
            value: 2,
            type: SettingTypes.Number,
            description: {
                0: 'Never',
                1: 'When Visible',
                2: 'Always',
            },
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent, MiraSwooperAbilities.Swoop, MiraSwooperAbilities.Unswoop],
};
