import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraJailorAbilities = {
    Jail: {
        name: 'Jail (Uwięź)',
        icon: '/images/mira/abilities/JailButton.png',
    },
    Execute: {
        name: 'Execute (Wykonaj)',
        icon: '/images/mira/abilities/ExecuteClean.png',
    },
};

export const MiraJailor: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Power,
    name: 'Jailor',
    id: 'mira_jailor',
    color: '#A6A6A6',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Jailor.png',
    description: 'Jailor może więzić innych graczy. Podczas spotkania wszyscy widzą, kto jest uwięziony, a Jailor może prywatnie rozmawiać z więźniem i później go wykonać.',
    settings: {
        ...probabilityOfAppearing(0),
        'Jail Cooldown': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Max Number of Executes': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Jail Same Person Twice In A Row': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Jailee Can Use Public Chat': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraJailorAbilities.Jail, MiraJailorAbilities.Execute],
};
