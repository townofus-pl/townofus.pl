import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {Teams} from '@/constants/teams';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraCrewpostor: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Alliance,
    name: 'Crewpostor',
    id: 'mira_crewpostor',
    color: '#00B7FF',
    team: Teams.Crewmate,
    icon: '/images/mira/modifiers/Crewpostor.png',
    description: 'Crewpostor jest modyfikatorem sojuszu załogi i zmusza gracza do pracy na rzecz frakcji Impostorów.',
    settings: {
        ...probabilityOfAppearing(0),
        'Crewpostor Replaces a Real Impostor': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Crewpostor Can Always Sabotage': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Crewpostor Gets Impostor Vision': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Crewpostor Appears Like a Traitor': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.None],
};
