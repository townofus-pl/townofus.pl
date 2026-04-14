import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraArsonistAbilities = {
    Douse: {
        name: 'Douse (Polej)',
        icon: '/images/mira/abilities/DouseButton.png',
    },
    Ignite: {
        name: 'Ignite (Podpal)',
        icon: '/images/mira/abilities/IgniteButton.png',
    },
    Vent: {
        name: 'Vent (Wentylacja)',
        icon: '/images/mira/abilities/ArsoVentButton.png',
    },
};

export const MiraArsonist: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Arsonist',
    id: 'mira_arsonist',
    color: '#FF4D00',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Arsonist.png',
    description: 'Arsonist wygrywa jako ostatni zabójca. Może polewać cele i podpalać je po spełnieniu warunków.',
    settings: {
        ...probabilityOfAppearing(0),
        'Douse Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Douse From Interactions': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Legacy Mode (No Radius)': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Arsonist Can Vent': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraArsonistAbilities.Douse, MiraArsonistAbilities.Ignite, MiraArsonistAbilities.Vent],
};

