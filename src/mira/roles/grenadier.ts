import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraGrenadierAbilities = {
    Flash: {
        name: 'Flash (Błysk)',
        icon: '/images/mira/abilities/FlashButton.png',
    },
};

export const MiraGrenadier: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Concealing,
    name: 'Grenadier',
    id: 'mira_grenadier',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Grenadier.png',
    description: 'Grenadier może rzucić granatem, który oślepia graczy w zasięgu i zamienia ich widzenie w szarość na określony czas.',
    settings: {
        ...probabilityOfAppearing(0),
        'Max Flashes': {
            value: Infinity,
            type: SettingTypes.Number,
        },
        'Flash Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Flash Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Flash Radius': {
            value: 1,
            type: SettingTypes.Multiplier,
        },
        'Can Vent': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraGrenadierAbilities.Flash],
};
