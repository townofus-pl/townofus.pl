import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraAmbusherAbilities = {
    Pursue: {
        name: 'Pursue (Ścigaj)',
        icon: '/images/mira/abilities/PursueButton.png',
    },
    Ambush: {
        name: 'Ambush (Zasadzka)',
        icon: '/images/mira/abilities/AmbushButton.png',
    },
};

export const MiraAmbusher: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Ambusher',
    id: 'mira_ambusher',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Ambusher.png',
    description: 'Ambusher może ścigać gracza i dostaje strzałkę do jego pozycji. Gdy ścigany cel stoi obok innego gracza, Ambusher może użyć zasadzki, by zmusić ścigany cel do zabicia pobliskiej osoby. Po udanej zasadzce ciało jest przeciągane w cień i teleportowane do Ambushera.',
    settings: {
        ...probabilityOfAppearing(0),
        'Ambushes Users Per Game': {
            value: Infinity,
            type: SettingTypes.Number,
        },
        'Ambush Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Pursue Arrow Update Interval': {
            value: 2.5,
            type: SettingTypes.Time,
        },
        'Stop Pursuing Player on Ambush': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Ambusher Can Vent': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraAmbusherAbilities.Pursue, MiraAmbusherAbilities.Ambush],
};
