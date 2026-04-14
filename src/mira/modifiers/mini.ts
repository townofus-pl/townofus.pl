import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraMini: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.UniversalModifier,
    name: 'Mini',
    id: 'mira_mini',
    color: '#ccffe6',
    team: Teams.All,
    icon: '/images/mira/modifiers/Mini.png',
    description: 'Jesteś mniejszy niż zwykli gracze i poruszasz się szybciej.',
    settings: {
        ...probabilityOfAppearing(0),
        'Mini Speed': {
            value: 1.35,
            type: SettingTypes.Multiplier,
        },
    },
    abilities: [MiraCommonAbilities.None],
};

