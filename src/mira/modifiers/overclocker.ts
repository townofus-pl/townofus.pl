import {Modifier, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraOverclocker: Modifier = {
    type: RoleOrModifierTypes.Modifier,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.AssailantModifier,
    name: 'Overclocker',
    id: 'mira_overclocker',
    color: '#fc912e',
    team: Teams.Assailant,
    icon: '/images/mira/modifiers/Overclocker.png',
    description: 'Overclocker może używać kamer zawsze i wszędzie, ale z ograniczoną baterią.',
    settings: {
        ...probabilityOfAppearing(0),
        'Overclock Cooldown': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Overclock Duration': {
            value: 50,
            type: SettingTypes.Time,
        },
        'Allow Overclock In First Round': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Overclock Uses': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Overclock Cooldown Multiplier': {
            value: 2,
            type: SettingTypes.Multiplier,
        },
        'Underclock Cooldown Multiplier': {
            value: 0.5,
            type: SettingTypes.Multiplier,
        },
    },
    abilities: [MiraCommonAbilities.None],
};

