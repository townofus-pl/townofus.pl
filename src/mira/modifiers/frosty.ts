import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraFrosty: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.CrewmateModifier,
    name: 'Frosty',
    id: 'mira_frosty',
    color: '#99ffff',
    team: Teams.Crewmate,
    icon: '/images/mira/modifiers/Frosty.png',
    description: 'Po śmierci Frosty zabójca zostaje spowolniony.',
    settings: {
        ...probabilityOfAppearing(0),
        'Chill Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Chill Start Speed': {
            value: 0.75,
            type: SettingTypes.Multiplier,
        },
    },
    abilities: [MiraCommonAbilities.None],
};

