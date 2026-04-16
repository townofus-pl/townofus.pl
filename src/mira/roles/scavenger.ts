import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraScavenger: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Scavenger',
    id: 'mira_scavenger',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Scavenger.png',
    description: 'Scavenger musi zabijać swoje cele. Jeśli trafi poprawnie, dostaje krótszy cooldown; jeśli nie, cooldown znacząco rośnie.',
    settings: {
        ...probabilityOfAppearing(0),
        'Scavenge Duration': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Increased Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Correct Kill Cooldown': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Incorrect Kill Multiplier': {
            value: 3,
            type: SettingTypes.Multiplier,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent],
};
