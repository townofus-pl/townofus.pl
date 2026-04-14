import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraMercenaryAbilities = {
    Guard: {
        name: 'Guard (Pilnuj)',
        icon: '/images/mira/abilities/GuardButton.png',
    },
    Bribe: {
        name: 'Bribe (Przekup)',
        icon: '/images/mira/abilities/BribeButton.png',
    },
};

export const MiraMercenary: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Benign,
    name: 'Mercenary',
    id: 'mira_mercenary',
    color: '#8C6699',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Mercenary.png',
    description: 'Mercenary zbiera złoto przez pilnowanie graczy i przekupuje innych, by wygrać razem z nimi.',
    settings: {
        ...probabilityOfAppearing(0),
        'Guard Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Max Number of Guards': {
            value: 6,
            type: SettingTypes.Number,
        },
        'Bribe Cost': {
            value: 2,
            type: SettingTypes.Number,
        },
    },
    abilities: [MiraMercenaryAbilities.Guard, MiraMercenaryAbilities.Bribe],
};
