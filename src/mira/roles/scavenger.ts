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
        'Scavenge Duration Increase Per Kill': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Scavenge Kill Cooldown On Correct Kill': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Kill Cooldown Multiplier On Incorrect Kill': {
            value: 3,
            type: SettingTypes.Multiplier,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent],
};
