import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {Teams} from '@/constants/teams';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraLovers: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Alliance,
    name: 'Lovers',
    id: 'mira_lovers',
    color: '#FF69B4',
    team: Teams.All,
    icon: '/images/mira/modifiers/Lover.png',
    description: 'Lovers to para graczy, która może wygrać razem, jeżeli oboje dotrwają do końcówki gry lub spełnią swoje warunki drużynowe.',
    settings: {
        ...probabilityOfAppearing(0),
        'Both Lovers Die and Revive Together': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Loving Another Killing Probability': {
            value: 20,
            type: SettingTypes.Percentage,
        },
        'Neutral Roles Can Be Lovers': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Lover Can Kill Faction Teammates': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Lovers Can Kill One Another': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.None],
};

