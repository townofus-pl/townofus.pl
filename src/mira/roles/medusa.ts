import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';


export const MiraMedusaAbilities = {
    Petrify: {
        name: 'Petrify (Petryfikuj)',
        icon: '/images/mira/abilities/Petrify.png',
    },
    StoneGaze: {
        name: 'Stone Gaze (Kamienny Wzrok)',
        icon: '/images/mira/abilities/StoneGaze.png',
    },
    Vent: {
        name: 'Vent (Wentylacja)',
        icon: '/images/mira/abilities/ReaperVentButton.png',
    },
};
export const MiraMedusa: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Medusa',
    id: 'mira_medusa',
    color: '#99FFCC',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Medusa.png',
    description: 'Medusa wygrywa jako ostatni zabójca. Zabija graczy zamieniając ich w kamienne posągi których nie można zreportować.',
    settings: {
        ...probabilityOfAppearing(0),
        'Petrify Cooldown': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Time For Victim To Become Stoned': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Time Before Stone Shatters': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Allow Stone Gazing': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Stone Gaze Cooldown': {
            value: 35,
            type: SettingTypes.Time,
        },
        'Stone Gaze Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Stone Gaze Uses': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Medusa Can Vent': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraMedusaAbilities.Petrify, MiraMedusaAbilities.StoneGaze, MiraMedusaAbilities.Vent],
};
