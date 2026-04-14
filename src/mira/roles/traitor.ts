import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraTraitorAbilities = {
    ChangeRole: {
        name: 'Change Role (Zmień rolę)',
        icon: '/images/mira/abilities/TraitorSelect.png',
    },
};

export const MiraTraitor: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Power,
    name: 'Traitor',
    id: 'mira_traitor',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Traitor.png',
    description: 'Traitor może przejąć rolę po spełnieniu warunków i odwrócić losy gry na korzyść impostorów.',
    settings: {
        ...probabilityOfAppearing(0),
        'Minimum People Alive When Traitor Can Spawn': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Traitor Won\'t Spawn if Neutral Killer is Alive': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Disable Existing Impostor Roles': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraTraitorAbilities.ChangeRole],
};
