import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import { MiraCommonAbilities } from '../abilities';

export const MiraMinerAbilities = {
    Mine: {
        name: 'Mine (Kop)',
        icon: '/images/mira/abilities/MineButton.png',
    },
};

export const MiraMiner: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Support,
    name: 'Miner',
    id: 'mira_miner',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Miner.png',
    description: 'Miner może tworzyć nowe wentylacje. Te wentylacje łączą się tylko ze sobą, tworząc nową ścieżkę.',
    settings: {
        ...probabilityOfAppearing(0),
        'Number of Miner Vents Per Game': {
            value: Infinity,
            type: SettingTypes.Number,
        },
        'Mine Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Mine Delay': {
            value: 3,
            type: SettingTypes.Time,
        },
        'Mine Visibility': {
            value: 'Immediately',
            type: SettingTypes.Text,
            description: {
                0: 'Immediately',
                1: 'After Use',
            },
        },
        'Miner Can Kill With Teammate': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent, MiraMinerAbilities.Mine],
};
