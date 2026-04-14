import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraSaboteur: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.ImpostorModifier,
    name: 'Saboteur',
    id: 'mira_saboteur',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/modifiers/Saboteur.png',
    description: 'Masz skrócony cooldown na sabotaże.',
    settings: {
        ...probabilityOfAppearing(0),
        'Reduced Sabo Cooldown': {
            value: 10,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraCommonAbilities.None],
};
