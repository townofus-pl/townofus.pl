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
        'Number Of Miner Vents Per Game': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: '∞',               
            },
        },
        'Mine Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Mine Visibility': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Immediate',
                1: 'After Use',
            },
        },
        'Mine Delay': {
            value: 3,
            type: SettingTypes.Time,
        },
        'Miner Can Kill With Teammate': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent, MiraMinerAbilities.Mine],
};
