import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraFlash: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.UniversalModifier,
    name: 'Flash',
    id: 'mira_flash',
    color: '#ff8080',
    team: Teams.All,
    icon: '/images/mira/modifiers/Flash.png',
    description: 'Poruszasz się szybciej niż zwykli gracze.',
    settings: {
        ...probabilityOfAppearing(0),
        'Flash Speed': {
            value: 1.75,
            type: SettingTypes.Multiplier,
        },
    },
    abilities: [MiraCommonAbilities.None],
};

