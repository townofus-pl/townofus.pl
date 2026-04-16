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
        'Kill Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Stalk Cooldown': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Stalk Duration': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Max Stalks': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Task Gains': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Retribution': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Report Body': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraHunterAbilities.Kill, MiraHunterAbilities.Stalk],
};
