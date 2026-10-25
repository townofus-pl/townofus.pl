import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

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
    description: 'Blackmailer może zaszantażować wybranego gracza, blokując mu możliwość pisania na czacie podczas następnego spotkania. Zaszantażowany gracz nie może również głosować, dopóki liczba żywych graczy przekracza próg określony w ustawieniach. Zależnie od ustawień informacja o szantażu może być widoczna także dla pozostałych graczy.',
    settings: {
        ...probabilityOfAppearing(0),
        'Number Of Blackmail Uses Per Game': {
            value: 0,
            type: SettingTypes.Number,
        },
        'Blackmail Cooldown': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Max Players Alive To Allow Voting': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Blackmail Same Person Twice In A Row': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Only Target Sees Blackmail': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Blackmailer Can Kill With Teammates': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent, MiraBlackmailerAbilities.Blackmail],
};
