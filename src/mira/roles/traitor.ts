import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import { MiraCommonAbilities } from '../abilities';

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
    description: `Jeśli wszyscy Impostorzy zginą, po meetingu jeden Crewmate może stać się Traitorem, zależnie od ustawionych warunków. Traitor stara się wygrać grę dla poległych Impostorów i wyeliminować całą załogę. Tylko Crewmate może zostać Traitorem, z wyjątkiem Mayora.

Podobnie jak Imitator i Ambassador, Traitor może zmieniać role, wybierając inną rolę Impostora z menu. Wtedy nadal można go wskazać jako Traitor podczas zgadywania ról.`,
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
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent, MiraTraitorAbilities.ChangeRole],
};
