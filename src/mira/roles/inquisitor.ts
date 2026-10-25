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
        name: 'Vanquish (Zgładź)',
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
    description: 'Inquisitor otrzymuje listę heretyckich ról i wygrywa, gdy wymagana liczba jego celów zostanie wyeliminowana. Podczas spotkań może używać Inquire, aby sprawdzać, czy wybrany gracz jest heretykiem. Może też sam zabijać zdolnością Vanquish, ale zabicie osoby, która nie jest heretykiem, odbiera mu tę możliwość do końca gry. Heretycy nie muszą zginąć z jego ręki.',
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
        'Inquisitor Can\'t Inquire': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Inquire Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Max Number Of Inquiries': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Amount Of Heretics Needed': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Hide Role On Win Notification': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraInquisitorAbilities.Vanquish, MiraInquisitorAbilities.Inquire],
};

