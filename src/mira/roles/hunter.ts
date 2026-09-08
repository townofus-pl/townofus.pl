import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraHunterAbilities = {
    Stalk: {
        name: 'Stalk (Śledź)',
        icon: '/images/mira/abilities/StalkButton.png',
    },
    Kill: {
        name: 'Kill (Zabij)',
        icon: '/images/mira/abilities/HunterKillButton.png',
    },
};

export const MiraHunter: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Hunter',
    id: 'mira_hunter',
    color: '#29AB87',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Hunter.png',
    description: "Hunter może śledzić graczy i dostaje zielony sygnał, gdy śledzony użyje jakiejkolwiek zdolności (nick tego gracza zrobi się czarny). Hunter ma wtedy możliwość zabicia gracza w dowolnym momencie gry, bez żadnych konsekwencji, jeśli zabije on Crewmate'a (pod warunkiem, że nie jest on aktywowanym Veteranem).",
    settings: {
        ...probabilityOfAppearing(0),
        'Hunter Kill Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Hunter Stalk Cooldown': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Hunter Stalk Duration': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Initial Stalks Uses': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Tasks Required For Additional Stalk Use': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'Off',
                //TODO: -1 = ∞
            },
        },
        'Stalks Triggered By': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'All Abilities',
                1: 'Interactions',
            },
        },
        'Hunter Sees Interaction Type': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Hunter Kills Last Voter if Voted Out': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Hunter Can Report Who They\'ve Killed': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraHunterAbilities.Kill, MiraHunterAbilities.Stalk],
};
