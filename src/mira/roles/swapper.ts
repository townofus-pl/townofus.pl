import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraSwapperAbilities = {
    Swap: {
        name: 'Swap (Zamień)',
        icon: '/images/mira/abilities/SwapActive.png',
    },
};

export const MiraSwapper: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Power,
    name: 'Swapper',
    id: 'mira_swapper',
    color: '#66E666',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Swapper.png',
    description: 'Swapper może zamienić głosy dwóch graczy podczas spotkania, co na końcu spotkania zmienia ich wizualną pozycję i wynik ewentualnego wyrzucenia.',
    settings: {
        ...probabilityOfAppearing(0),
    },
    abilities: [MiraSwapperAbilities.Swap],
};
