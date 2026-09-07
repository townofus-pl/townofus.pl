import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraBarkeeperAbilities = {
    Roleblock: {
        name: 'Roleblock (Zablokuj rolę)',
        icon: '/images/mira/abilities/BeerRoleblockButton.png',
    },
    Spill: {
        name: 'Spill (Wylej)',
        icon: '/images/mira/abilities/BeerSpillButton.png',
    },
};

export const MiraBarkeeper: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Protective,
    name: 'Barkeeper',
    id: 'mira_barkeeper',
    color: '#e3d477',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Barkeeper.png',
    description: 'Barkeeper może pić z innymi, aby zablokować ich role, tymczasowo wyłączając ich zdolności. Może również wylać drinka na innego gracza, aby przyspieszyć lub spowolnić jego ruch.',
    settings: {
        ...probabilityOfAppearing(0),
        'Roleblock Cooldown': {
            value: 22.5,
            type: SettingTypes.Time,
        },
        'Minimum Roleblock Delay': {
            value: 3,
            type: SettingTypes.Time,
        },
        'Maximum Roleblock Delay': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Spill Settle Delay': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Time Before Spill Slows Players Down': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Additional Time For Spill To Be Removed': {
            value: 30,
            type: SettingTypes.Time,
        },
        'Amount Of Time Player is Affected By Spill': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Spill Speed Buff Multiplier': {
            value: 1.2,
            type: SettingTypes.Multiplier,
        },
        'Spill Speed Debuff Multiplier': {
            value: 0.8,
            type: SettingTypes.Multiplier,
        },
    },
    abilities: [MiraBarkeeperAbilities.Roleblock, MiraBarkeeperAbilities.Spill],
};
