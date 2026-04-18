import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraOfficerAbilities = {
    Shoot: {
        name: 'Shoot (Strzelaj)',
        icon: '/images/mira/abilities/OfficerShootButton.png',
    },
    Load: {
        name: 'Load (Ładuj)',
        icon: '/images/mira/abilities/OfficerLoadButton.png',
    },
};

export const MiraOfficer: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Officer',
    id: 'mira_officer',
    color: '#4D99FF',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Officer.png',
    description: 'Officer może strzelać do graczy ograniczoną amunicją. Officer musi doładowywać naboje; standardowo wygasają po jednej rundzie, chyba że zostaną załadowane 10 sekund przed meetingiem.',
    settings: {
        ...probabilityOfAppearing(0),
        'Shoot Cooldown': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Load Cooldown': {
            value: 30,
            type: SettingTypes.Time,
        },
        'Bullets at Once': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Bullets Total': {
            value: 9,
            type: SettingTypes.Number,
        },
        'Can Self Report': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Allow Shooting in First Round': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Officer Can Only Shoot Players That Have Killed': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Crewmate Killing Roles are Innocent': {
            value: false,
            type: SettingTypes.Boolean,
        },
        '# of Rounds to Shoot Again After Misfire': {
            value: 1,
            type: SettingTypes.Number,
        },
    },
    abilities: [MiraOfficerAbilities.Shoot, MiraOfficerAbilities.Load],
};
