import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraMirrorcasterAbilities = {
    MagicMirror: {
        name: 'Magic Mirror (Magiczne Zwierciadło)',
        icon: '/images/mira/abilities/MagicMirrorButton.png',
    },
    Unleash: {
        name: 'Unleash (Uwolnij)',
        icon: '/images/mira/abilities/UnleashButton.png',
    },
};

export const MiraMirrorcaster: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Protective,
    name: 'Mirrorcaster',
    id: 'mira_mirrorcaster',
    color: '#90A2C3',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Mirrorcaster.png',
    description: 'Mirrorcaster może nałożyć Magic Mirror na gracza. Jeśli gracz zostanie zaatakowany bezpośrednio, Mirrorcaster zostaje ostrzeżony i może uwolnić pochłonięty atak na innego gracza.',
    settings: {
        ...probabilityOfAppearing(0),
        'Who Gets Murder Attempt Indicator': {
            value: 'Mirrorcaster + Killer',
            type: SettingTypes.Text,
            description: {
                0: 'Mirrorcaster',
                1: 'Mirrorcaster + Killer',
            },
        },
        'Magic Mirror Cooldown': {
            value: 0,
            type: SettingTypes.Time,
        },
        'Magic Mirror Duration': {
            value: 30,
            type: SettingTypes.Time,
        },
        'Unleash Cooldown': {
            value: 15,
            type: SettingTypes.Time,
        },
        'Attack Information Received Upon Attack': {
            value: 'Subalignment',
            type: SettingTypes.Text,
            description: {
                0: 'Role',
                1: 'Faction',
                2: 'Subalignment',
                3: 'Nothing',
            },
        },
        'Accumulate Multiple Unleashes': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Max Number of Magic Mirrors': {
            value: 5,
            type: SettingTypes.Number,
        },
    },
    abilities: [MiraMirrorcasterAbilities.MagicMirror, MiraMirrorcasterAbilities.Unleash],
};
