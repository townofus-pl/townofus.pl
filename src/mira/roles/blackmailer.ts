import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraBlackmailerAbilities = {
    Blackmail: {
        name: 'Blackmail (Szantażuj)',
        icon: '/images/mira/abilities/BlackmailButton.png',
    },
};

export const MiraBlackmailer: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Support,
    name: 'Blackmailer',
    id: 'mira_blackmailer',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Blackmailer.png',
    description: 'Blackmailer może uciszyć gracza na następne spotkanie, oznaczając go czarną literą M i blokując mu możliwość pisania na czacie.',
    settings: {
        ...probabilityOfAppearing(0),
        'Number of Blackmail Uses Per Game': {
            value: Infinity,
            type: SettingTypes.Number,
        },
        'Blackmail Cooldown': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Max Players Alive Where Blackmailed Can Vote': {
            value: 10,
            type: SettingTypes.Number,
        },
        'Blackmail Same Person Twice In A Row': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'OnlyTarget Sees Blackmail': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Blackmailer Can Kill with Teammate': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraBlackmailerAbilities.Blackmail],
};
