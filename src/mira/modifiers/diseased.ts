import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraDiseased: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.CrewmateModifier,
    name: 'Diseased',
    id: 'mira_diseased',
    color: '#808080',
    team: Teams.Crewmate,
    icon: '/images/mira/modifiers/Diseased.png',
    description: 'Po śmierci Diseased cooldown zabójcy jest mnożony przez ustawiony mnożnik.',
    settings: {
        ...probabilityOfAppearing(0),
        'Cooldown Multiplier': {
            value: 3,
            type: SettingTypes.Multiplier,
        },
    },
    abilities: [MiraCommonAbilities.None],
};

