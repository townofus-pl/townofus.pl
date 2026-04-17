import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraTelepath: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.ImpostorModifier,
    name: 'Telepath',
    id: 'mira_telepath',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/modifiers/Telepath.png',
    description: 'Wie, kiedy sojusznik zabija i (wg ustawień) gdzie. Może też dostawać info o jego śmierci i zgadywaniu.',
    settings: {
        ...probabilityOfAppearing(0),
        'Know Kill Location': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Know Death Time': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Know Death Location': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Arrow Duration': {
            value: 2.5,
            type: SettingTypes.Time,
        },
        'Know About Correct Guess': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Know About Failed Guess': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.None],
};

