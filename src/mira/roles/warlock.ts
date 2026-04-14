import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraWarlockAbilities = {
    Hex: {
        name: 'Hex',
        icon: '/images/mira/abilities/HexButton.png',
    },
    HexBomb: {
        name: 'Hex Bomb',
        icon: '/images/mira/abilities/HexBombButton.png',
    },
};

export const MiraWarlock: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Warlock',
    id: 'mira_warlock',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Warlock.png',
    description: 'Warlock może naładować ataki i po pełnym naładowaniu wykonywać wielokrotne zabójstwa przez określony czas.',
    settings: {
        ...probabilityOfAppearing(0),
        'Times it Takes to Fully Charge': {
            value: 25,
            type: SettingTypes.Time,
        },
        'time Multiplier Added Per Kill for Next Charge': {
            value: 0.05,
            type: SettingTypes.Multiplier,
        },
        'Times it Takes to Use a Full Charge': {
            value: 1,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraWarlockAbilities.Hex, MiraWarlockAbilities.HexBomb],
};
