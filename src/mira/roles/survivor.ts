import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraSurvivorAbilities = {
    Safeguard: {
        name: 'Safeguard',
        icon: '/images/mira/abilities/VestButton.png',
    },
};

export const MiraSurvivor: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Benign,
    name: 'Survivor',
    id: 'mira_survivor',
    color: '#FFE64D',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Survivor.png',
    description: 'Survivor wygrywa, jeśli dożyje końca gry, i może tymczasowo chronić się przed zabiciem.',
    settings: {
        ...probabilityOfAppearing(0),
        'Vest Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Vest Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Max Number of Vests': {
            value: 10,
            type: SettingTypes.Number,
        },
        'Survivor Scatter Mechanic Enabled': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Survivor Scatter Timer': {
            value: 25,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraSurvivorAbilities.Safeguard],
};

