import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraClericAbilities = {
    Cleanse: {
        name: 'Cleanse (Oczyść)',
        icon: '/images/mira/abilities/CleanseButton.png',
    },
    Barrier: {
        name: 'Barrier (Nałóż Barierę)',
        icon: '/images/mira/abilities/BarrierButton.png',
    },
};

export const MiraCleric: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Protective,
    name: 'Cleric',
    id: 'mira_cleric',
    color: '#00FFB2',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Cleric.png',
    description: 'Cleric może oczyszczać negatywne efekty oraz nakładać bariery na graczy, aby chronić ich przed interakcjami.',
    settings: {
        ...probabilityOfAppearing(0),
        'Barrier Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Barrier Duration': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Cleanse Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Show Barriered Player': {
            value: 'Cleric',
            type: SettingTypes.Text,
            description: {
                0: 'Self',
                1: 'Cleric',
                2: 'Self+Cleric',
            },
        },
        'Cleric Gets Attack Notification': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraClericAbilities.Cleanse, MiraClericAbilities.Barrier],
};
