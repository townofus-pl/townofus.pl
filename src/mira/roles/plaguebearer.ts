import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraPlaguebearerAbilities = {
    Infect: {
        name: 'Infect (Zaraz)',
        icon: '/images/mira/abilities/InfectButton.png',
    },
};

export const MiraPlaguebearer: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Plaguebearer',
    id: 'mira_plaguebearer',
    color: '#E6FFB3',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Plaguebearer.png',
    description: 'Plaguebearer musi zarazić wszystkich pozostałych graczy, aby przemienić się w Pestilence.',
    settings: {
        ...probabilityOfAppearing(0),
        'Infect Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Announce Pestilence Transformation': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraPlaguebearerAbilities.Infect],
};
