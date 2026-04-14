import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraBomberAbilities = {
    Place: {
        name: 'Place (Podłóż)',
        icon: '/images/mira/abilities/DetonatingButton.png',
    },
};

export const MiraBomber: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Bomber',
    id: 'mira_bomber',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Bomber.png',
    description: 'Bomber może podkładać bomby, które eksplodują po chwili i zabijają wszystkich graczy w promieniu wybuchu.',
    settings: {
        ...probabilityOfAppearing(0),
        'Max Bombs': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Detonate Delay': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Detonate Radius': {
            value: 0.25,
            type: SettingTypes.Multiplier,
        },
        'Max Kills': {
            value: 5,
            type: SettingTypes.Number,
        },
        'All Imps See Bomb': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Vent': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraBomberAbilities.Place],
};
