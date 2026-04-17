import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraSatelliteAbilities = {
    Broadcast: {
        name: 'Broadcast',
        icon: '/images/mira/abilities/BroadcastButton.png',
    },
};

export const MiraSatellite: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.UniversalModifier,
    name: 'Satellite',
    id: 'mira_satellite',
    color: '#99BDD6',
    team: Teams.All,
    icon: '/images/mira/modifiers/Satellite.png',
    description: 'Możesz nadać sygnał i dostać info, gdzie są martwe ciała.',
    settings: {
        ...probabilityOfAppearing(0),
        'Button Cooldown': {
            value: 30,
            type: SettingTypes.Time,
        },
        'Max Uses': {
            value: 1,
            type: SettingTypes.Number,
        },
        'One Use Per Round': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'First Round Use': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraSatelliteAbilities.Broadcast],
};

