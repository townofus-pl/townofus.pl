import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import { MiraCommonAbilities } from '../abilities';

export const MiraParasiteAbilities = {
    Overtake: {
        name: 'Overtake (Przejmij)',
        icon: '/images/mira/abilities/OvertakeButton.png',
    },
};

export const MiraParasite: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Parasite',
    id: 'mira_parasite',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Parasite.png',
    description: 'Parasite może przejąć pobliskiego gracza, sterować nim chwilowo i zabić go przed końcem kontroli. Podczas kontroli Parasite porusza się WASD, a kontrolowanym graczem steruje się strzałkami.',
    settings: {
        ...probabilityOfAppearing(0),
        'Overtake Cooldown': {
            value: 37.5,
            type: SettingTypes.Time,
        },
        'Kill Cooldown': {
            value: 3,
            type: SettingTypes.Time,
        },
        'Control Duration': {
            value: 30,
            type: SettingTypes.Time,
        },
        'Save Victim if Parasite Dies': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Save Victim if Meeting Called': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Parasite Can Vent': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Parasite Can Move Independently': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Overtaken Looks Like Parasite': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.Vent, MiraParasiteAbilities.Overtake],
};
