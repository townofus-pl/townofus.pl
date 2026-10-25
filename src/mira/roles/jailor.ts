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
        name: 'Execute (Dokonaj Egzekucji)',
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
    description: 'Jailor może uwięzić wybranego gracza. Podczas następnego spotkania wszyscy widzą, kto jest więźniem, a Jailor może z nim prywatnie rozmawiać i zdecydować o wykonaniu egzekucji. Jeśli zabije w ten sposób Crewmate’a, traci możliwość dalszego więzienia. Imitator naśladujący Jailora nie może wykonywać egzekucji.',
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
