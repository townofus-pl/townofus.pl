import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraWardenAbilities = {
    Fortify: {
        name: 'Fortify (Fortyfikuj)',
        icon: '/images/mira/abilities/FortifyButton.png',
    },
};

export const MiraWarden: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Protective,
    name: 'Warden',
    id: 'mira_warden',
    color: '#9900FF',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Warden.png',
    description: 'Warden może fortyfikować graczy, chroniąc ich przed wszelkimi interakcjami. Jeśli ktoś spróbuje wejść w interakcję z ufortyfikowanym graczem, zarówno Warden, jak i cel otrzymają alert.',
    settings: {
        ...probabilityOfAppearing(0),
        'Show Fortified Player': {
            value: 'Fortified + Warden',
            type: SettingTypes.Text,
            description: {
                0: 'Fortified',
                1: 'Warden',
                2: 'Fortified + Warden',
                3: 'Everyone',
            },
        },
    },
    abilities: [MiraWardenAbilities.Fortify],
};
