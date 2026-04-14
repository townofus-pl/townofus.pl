import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraSheriffAbilities = {
    Shoot: {
        name: 'Shoot (Strzał)',
        icon: '/images/mira/abilities/SheriffShootButton.png',
    },
};

export const MiraSheriff: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Sheriff',
    id: 'mira_sheriff',
    color: '#FFFF00',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Sheriff.png',
    description: 'Sheriff może strzelać do podejrzanych graczy. W zależności od ustawień błędny strzał może zabić Sheriffa albo odebrać mu możliwość dalszego strzelania.',
    settings: {
        ...probabilityOfAppearing(0),
        'Kill Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Can Self Report': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Allow Shooting in First Round': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Can Shot Neutral Evil Roles': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Shoot Neutral Killer Roles': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Shoot Neutral Outlier Roles': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Misfire Kills': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Sheriff',
                1: 'Target',
                2: 'Sheriff & Target',
                3: 'No One',
            },
        },
    },
    abilities: [MiraSheriffAbilities.Shoot],
};
