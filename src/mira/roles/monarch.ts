import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraMonarchAbilities = {
    Knight: {
        name: 'Knight (Pasuj)',
        icon: '/images/mira/abilities/KnightButton.png',
    },
};

export const MiraMonarch: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Power,
    name: 'Monarch',
    id: 'mira_monarch',
    color: '#EA535B',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Monarch.png',
    description: 'Monarch może pasować innych graczy, dając im dodatkowe głosy.',
    settings: {
        ...probabilityOfAppearing(0),
        'Knight Cooldown': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Maximum Knights': {
            value: 2,
            type: SettingTypes.Number,
            description: {
                0: '∞',
            }
        },
        'Votes Per Knight': {
            value: 1,
            type: SettingTypes.Number,
        },
        'Knight Delay (Cancellable)': {
            value: 3,
            type: SettingTypes.Time,
        },
        'Reveal Knighting At Meeting': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Show Knighted Votes': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Allow Round One Knighting': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Inform Monarch if a Knight Dies': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Crew Knights Grant Kill Immunity': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraMonarchAbilities.Knight],
};
