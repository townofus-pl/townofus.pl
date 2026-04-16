import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import { MiraCommonAbilities } from '../abilities';

export const MiraEscapistAbilities = {
    Mark: {
        name: 'Mark (Zaznacz)',
        icon: '/images/mira/abilities/MarkButton.png',
    },
    Recall: {
        name: 'Recall (Powrót)',
        icon: '/images/mira/abilities/RecallButton.png',
    },
};

export const MiraEscapist: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Concealing,
    name: 'Escapist',
    id: 'mira_escapist',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Escapist.png',
    description: 'Escapist może oznaczyć miejsce na mapie, a następnie wrócić do niego z dowolnego miejsca.',
    settings: {
        ...probabilityOfAppearing(0),
        'Max Recalls': {
            value: Infinity,
            type: SettingTypes.Number,
        },
        'Recall Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Can Vent': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent, MiraEscapistAbilities.Mark, MiraEscapistAbilities.Recall],
};
