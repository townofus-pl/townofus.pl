import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraTimeLordAbilities = {
    Rewind: {
        name: 'Rewind (Cofnij czas)',
        icon: '/images/mira/abilities/RewindButton.png',
    },
};

export const MiraTimeLord: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Power,
    name: 'Time Lord',
    id: 'mira_time_lord',
    color: '#8789D3',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/TimeLord.png',
    description: 'Time Lord może cofać czas, zmuszając graczy do cofnięcia ruchów i potencjalnie przywracając martwych graczy do życia.',
    settings: {
        ...probabilityOfAppearing(0),
        'Rewind Cooldown': {
            value: 30,
            type: SettingTypes.Time,
        },
        'Rewind History': {
            value: 7.5,
            type: SettingTypes.Time,
        },
        'Initial Uses': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Tasks Required for Additional Rewind Use': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Can Use Vitals': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Revive on Rewind': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Undo Tasks On Rewind': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Unclean Bodies On Rewind': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Notify Time Lord on Revive': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraTimeLordAbilities.Rewind],
};
