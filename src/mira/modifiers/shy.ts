import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraShy: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.UniversalModifier,
    name: 'Shy',
    id: 'mira_shy',
    color: '#ffb3cc',
    team: Teams.All,
    icon: '/images/mira/modifiers/Shy.png',
    description: 'Gdy stoisz w miejscu, z czasem stajesz się coraz bardziej przezroczysty.',
    settings: {
        ...probabilityOfAppearing(0),
        'Transparency Delay': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Transparency Duration': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Final Opacity': {
            value: 20,
            type: SettingTypes.Percentage,
        },
    },
    abilities: [MiraCommonAbilities.None],
};
