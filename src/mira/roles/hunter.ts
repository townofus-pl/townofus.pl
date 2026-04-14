import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraHunterAbilities = {
    Stalk: {
        name: 'Stalk (Śledź cel)',
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
    description: 'Hunter może śledzić graczy i dostaje sygnał, gdy śledzony użyje jakiejkolwiek zdolności. Taki cel trafia na listę i Hunter może go później zabić.',
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
    abilities: [MiraHunterAbilities.Stalk, MiraHunterAbilities.Kill],
};
