import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraInquisitorAbilities = {
    Inquire: {
        name: 'Inquire (Wypytaj)',
        icon: '/images/mira/abilities/InquireButton.png',
    },
    Vanquish: {
        name: 'Vanquish (Zgladz)',
        icon: '/images/mira/abilities/InquisKillButton.png',
    },
};

export const MiraInquisitor: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Outlier,
    name: 'Inquisitor',
    id: 'mira_inquisitor',
    color: '#D94291',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Inquisitor.png',
    description: 'Inquisitor wygrywa przez eliminację heretyków i może ich wyszukiwać poprzez zdolność Inquire podczas spotkań.',
    settings: {
        ...probabilityOfAppearing(0),
        'Vanquish Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Allow Vanquish in First Round': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Inquisitor Continues Game in Final 3': {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Inquisitor Can't Inquire": {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Inquire Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Max Number of Inquiries': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Amount of Heretics Needed': {
            value: 3,
            type: SettingTypes.Number,
        },
    },
    abilities: [MiraInquisitorAbilities.Inquire, MiraInquisitorAbilities.Vanquish],
};

