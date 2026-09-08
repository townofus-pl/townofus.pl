import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import { MiraCommonAbilities } from '../abilities';

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
        'Bomb Uses Per Game': {
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
        'Max Kills In Detonation': {
            value: 5,
            type: SettingTypes.Number,
        },
        'All Impostors See Bomb': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Allow Bombing in First Round': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Bomber Can Vent': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent, MiraBomberAbilities.Place],
};
