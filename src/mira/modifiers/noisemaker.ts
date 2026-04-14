import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraNoisemaker: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.CrewmateModifier,
    name: 'Noisemaker',
    id: 'mira_noisemaker',
    color: '#E8699D',
    team: Teams.Crewmate,
    icon: '/images/mira/modifiers/Noisemaker.png',
    description: 'Po śmierci Noisemaker pokazuje czerwony wskaźnik ciała wszystkim na mapie.',
    settings: {
        ...probabilityOfAppearing(0),
        'Impostors Alerted': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Neutrals Alerted': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Comms Affected': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Body Check': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Alert Duration': {
            value: 5,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraCommonAbilities.None],
};

