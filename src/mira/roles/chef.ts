import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraChefAbilities = {
    Cook: {
        name: 'Cook (Gotuj)',
        icon: '/images/mira/abilities/CookButton.png',
    },
    Serve: {
        name: 'Serve (Podaj)',
        icon: '/images/mira/abilities/ChefServe.gif',
    },
};

export const MiraChef: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Outlier,
    name: 'Chef',
    id: 'mira_chef',
    color: '#DAA267',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Chef.png',
    description: 'Chef musi gotować martwe ciała i serwować posiłki innym graczom, by osiągnąć wymagany limit i wygrać.',
    settings: {
        ...probabilityOfAppearing(0),
        'Cook Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Serve Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Reset Cook & Serve Cooldowns Together': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Amount Of Servings Needed': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Duration of Side Effects': {
            value: 60,
            type: SettingTypes.Time,
        },
        'Show Arrows Pointing To Dead Bodies': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Dead Body Arrow Delay': {
            value: 0.5,
            type: SettingTypes.Time,
        },
        'Dead Body Arrow Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Hide Role On Win Notification': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraChefAbilities.Cook, MiraChefAbilities.Serve],
};

