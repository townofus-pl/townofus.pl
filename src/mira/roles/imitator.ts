import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraImitatorAbilities = {
    Imitate: {
        name: 'Imitate (Naśladuj)',
        icon: '/images/mira/abilities/ImitateSelect.png',
    },
};

export const MiraImitator: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Support,
    name: 'Imitator',
    id: 'mira_imitator',
    color: '#B3D94D',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Imitator.png',
    description: 'Imitator może używać ról martwych graczy. Podczas spotkania wybiera martwego gracza i w następnej rundzie przejmuje jego rolę oraz umiejętności.',
    settings: {
        ...probabilityOfAppearing(0),
        'Imitate Neutral Counterparts': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Imitate Impostor Counterparts': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Imitate Basic Crewmate': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Imitator Must Be Guessed As': {
            value: 2,
            type: SettingTypes.Number,
            description: {
                0: 'Imitator',
                1: 'Imitated Role',
                2: 'Imitator or Imitated Role',
            },
        },
    },
    abilities: [MiraImitatorAbilities.Imitate],
};
