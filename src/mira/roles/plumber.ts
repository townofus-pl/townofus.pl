import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraPlumberAbilities = {
    Barricade: {
        name: 'Barricade (Zatkaj)',
        icon: '/images/mira/abilities/BarricadeButton.png',
    },
    Flush: {
        name: 'Flush (Przepłucz)',
        icon: '/images/mira/abilities/FlushButton.png',
    },
};

export const MiraPlumber: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Support,
    name: 'Plumber',
    id: 'mira_plumber',
    color: '#CC6600',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Plumber.png',
    description: 'Plumber może blokować wenty barierami i przepłukiwać system wentów, wypychając z nich graczy. Po przepłukaniu przez chwilę widzi kierunek wyrzuconego gracza.',
    settings: {
        ...probabilityOfAppearing(0),
        'Flush Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Block Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Max Number of Barricades': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Amount of Rounds Barricades Last': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Get More Barricades From Completing Tasks': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraPlumberAbilities.Barricade, MiraPlumberAbilities.Flush],
};
