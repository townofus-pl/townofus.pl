import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraUnderdog: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.ImpostorModifier,
    name: 'Underdog',
    id: 'mira_underdog',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/modifiers/Underdog.png',
    description: 'Masz niższy kill cooldown, gdy grasz solo lub Twój teammate nie żyje.',
    settings: {
        ...probabilityOfAppearing(0),
        'Cooldown Bonus': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Extra Imp Cooldown': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.None],
};

