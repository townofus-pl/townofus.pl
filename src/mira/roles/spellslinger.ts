import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import { MiraCommonAbilities } from '../abilities';

export const MiraSpellslingerAbilities = {
    Hex: {
        name: 'Hex',
        icon: '/images/mira/abilities/HexButton.png',
    },
    HexBomb: {
        name: 'Hex Bomb',
        icon: '/images/mira/abilities/HexBombButton.png',
    },
};

export const MiraSpellslinger: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Power,
    name: 'Spellslinger',
    id: 'mira_spellslinger',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Spellslinger.png',
    description: 'Spellslinger może nakładać hexy na graczy. Gdy wszyscy żywi gracze poza Impostorami zostaną zaklęci, może uruchomić odliczanie do wybuchu Hex Bomby, zapewniającej zwycięstwo Impostorom. Po rozpoczęciu odliczania jedynym sposobem zatrzymania bomby jest wyeliminowanie Spellslingera przed upływem czasu.',
    settings: {
        ...probabilityOfAppearing(0),
        'Hex Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Max Hexes': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Hex Bomb Countdown Duration': {
            value: 120,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent, MiraSpellslingerAbilities.Hex, MiraSpellslingerAbilities.HexBomb],
};
