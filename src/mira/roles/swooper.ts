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
        'Max Swoops': {
            value: Infinity,
            type: SettingTypes.Number,
        },
        'Swoop Cooldown': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Swoop Duration': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Can Vent': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent, MiraSwooperAbilities.Swoop, MiraSwooperAbilities.Unswoop],
};
