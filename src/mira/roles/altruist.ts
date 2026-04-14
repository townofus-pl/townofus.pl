import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraAltruistAbilities = {
    Revive: {
        name: 'Revive (Wskrześ)',
        icon: '/images/mira/abilities/ReviveButton.png',
    },
};

export const MiraAltruist: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Protective,
    name: 'Altruist',
    id: 'mira_altruist',
    color: '#660000',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Altruist.png',
    description: 'Altruist może wskrzeszać martwych graczy na jeden z trzech sposobów (w zależności od ustawień). Podczas tej akcji zabójcy są ostrzegani i poznają lokalizację Altruista oraz wskrzeszonych graczy.',
    settings: {
        ...probabilityOfAppearing(0),
        'Revive Type': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Group Sacrifice',
                1: 'Group Revive',
                2: 'Sacrifice',
            },
        },
        'Revive Range': {
            value: 0.25,
            type: SettingTypes.Multiplier,
        },
        'Revive Duration': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Revive Uses (Group Revive)': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Freeze Altruist During Revive': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Hide Bodies at Beginning of Revive': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Killers Alerted Before Revive': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Nobody',
                1: 'Neutrals',
                2: 'Impostors',
                3: 'Neutrals and Impostors',
            },
        },
        'Kilers Alerted After Revive': {
            value: 3,
            type: SettingTypes.Number,
            description: {
                0: 'Nobody',
                1: 'Neutrals',
                2: 'Impostors',
                3: 'Neutrals and Impostors',
            },
        },
    },
    abilities: [MiraAltruistAbilities.Revive],
    tip: 'Najbezpieczniej wskrzeszać, gdy masz już pewność co do otoczenia: najpierw ustaw miejsce, potem użyj dłuższych tasków i unikaj odkrytych korytarzy.',
};
