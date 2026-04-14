import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {Teams} from '@/constants/teams';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraEgotist: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Alliance,
    name: 'Egotist',
    id: 'mira_egotist',
    color: '#639965',
    team: Teams.Crewmate,
    icon: '/images/mira/modifiers/Egotist.png',
    description: 'Egotist to modyfikator sojuszu załogi i wygrywa tylko wtedy, gdy załoga przegra.',
    settings: {
        ...probabilityOfAppearing(0),
        'Egotist Must Stay Alive To Win': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Egotist Speeds Up the Game': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Rounds Required for Speed/Cooldown Changes': {
            value: 1,
            type: SettingTypes.Number,
        },
        'Speed Addition': {
            value: 0.1,
            type: SettingTypes.Multiplier,
        },
        'Cooldown Reduction': {
            value: 1.5,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraCommonAbilities.None],
};
