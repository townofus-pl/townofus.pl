import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import { MiraCommonAbilities } from '../abilities';

export const MiraMorphlingAbilities = {
    Sample: {
        name: 'Sample (Pobierz próbkę)',
        icon: '/images/mira/abilities/SampleButton.png',
    },
    Morph: {
        name: 'Morph (Morfuj)',
        icon: '/images/mira/abilities/MorphButton.png',
    },
};

export const MiraMorphling: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Concealing,
    name: 'Morphling',
    id: 'mira_morphling',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Morphling.png',
    description: 'Morphling może pobrać próbkę innego gracza, a potem zamienić się w niego na pewien czas, aby się ukryć.',
    settings: {
        ...probabilityOfAppearing(0),
        'Max Samples': {
            value: Infinity,
            type: SettingTypes.Number,
        },
        'Max Morphs': {
            value: Infinity,
            type: SettingTypes.Number,
        },
        'Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Morph Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Can Vent': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent, MiraMorphlingAbilities.Sample, MiraMorphlingAbilities.Morph],
};
