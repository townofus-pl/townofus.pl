import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '@/mira/abilities';

export const MiraSnitch: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Investigative,
    name: 'Snitch',
    id: 'mira_snitch',
    color: '#D4AF37',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Snitch.png',
    description: 'Snitch musi ukończyć zadania, aby ujawnić Impostorów. Po ukończeniu zadań widzi ich strzałkami i czerwonymi nazwami, ale sam również zostaje ujawniony.',
    settings: {
        ...probabilityOfAppearing(0),
        'Snitch Reveals Neutral Killers': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Snitch Sees Traitor': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Snitch Sees Impostors In Meetings': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Snitch Sees Revealed Players\' Roles': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Tasks Remaining When Revealed': {
            value: 1,
            type: SettingTypes.Number,
        },
    },
    abilities: [MiraCommonAbilities.None],
    tip: 'Priorytetyzuj długie zadania i planuj timing kończenia tasków tak, by ograniczyć ryzyko sabotaży i odcięcia drogi.',
};
