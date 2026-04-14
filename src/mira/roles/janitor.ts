import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraJanitorAbilities = {
    Clean: {
        name: 'Clean (Posprzątaj)',
        icon: '/images/mira/abilities/CleanButton.png',
    },
};

export const MiraJanitor: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Support,
    name: 'Janitor',
    id: 'mira_janitor',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Janitor.png',
    description: 'Janitor może czyścić martwe ciała, usuwając dowody zbrodni i czyniąc ciało niemożliwym do zgłoszenia.',
    settings: {
        ...probabilityOfAppearing(0),
        'Clean Uses Per Games': {
            value: Infinity,
            type: SettingTypes.Number,
        },
        'Clean Cooldown': {
            value: 40,
            type: SettingTypes.Time,
        },
        'Clean Delay': {
            value: 2.5,
            type: SettingTypes.Time,
        },
        'Reset Kill & Clean Cooldowns Together': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Janitor Can Kill With Teammate': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraJanitorAbilities.Clean],
};
