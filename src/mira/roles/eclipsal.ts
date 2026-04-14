import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraEclipsalAbilities = {
    Blind: {
        name: 'Blind (Oślep)',
        icon: '/images/mira/abilities/BlindButton.png',
    },
};

export const MiraEclipsal: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Concealing,
    name: 'Eclipsal',
    id: 'mira_eclipsal',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Eclipsal.png',
    description: 'Eclipsal może oślepiać graczy w pobliżu, ograniczając ich widzenie do mapy i blokując zgłaszanie ciał. Po chwili widzenie wraca do normy.',
    settings: {
        ...probabilityOfAppearing(0),
        'Blind Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Blind Duration': {
            value: 15,
            type: SettingTypes.Time,
        },
        'Blind Radius': {
            value: 1,
            type: SettingTypes.Multiplier,
        },
    },
    abilities: [MiraEclipsalAbilities.Blind],
};
