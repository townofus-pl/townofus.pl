import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraGiant: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.UniversalModifier,
    name: 'Giant',
    id: 'mira_giant',
    color: '#ffb34d',
    team: Teams.All,
    icon: '/images/mira/modifiers/Giant.png',
    description: 'Jesteś większy niż zwykli gracze i poruszasz się wolniej.',
    settings: {
        ...probabilityOfAppearing(0),
        'Giant Speed': {
            value: 0.75,
            type: SettingTypes.Multiplier,
        },
    },
    abilities: [MiraCommonAbilities.None],
};

