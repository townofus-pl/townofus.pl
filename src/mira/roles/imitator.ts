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
    description: 'Imitator podczas spotkania wybiera martwego gracza, aby w następnej rundzie korzystać z jego roli i umiejętności. Nie może naśladować Politiciana, Mayora, Monarcha ani Time Lorda. Jako Jailor nie może wykonywać egzekucji, a jako Prosecutor oskarżać. Może naśladować Swappera i zamieniać głosy. Jako Vigilante nie otrzymuje bezpiecznych strzałów. Zależnie od ustawień może też naśladować role Neutralnych i Impostorów, otrzymując ich odpowiedniki po stronie załogi.',
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
