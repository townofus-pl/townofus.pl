import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraProsecutorAbilities = {
    Prosecute: {
        name: 'Prosecute (Oskarż)',
        icon: '/images/mira/abilities/ExecuteClean.png',
    },
};

export const MiraProsecutor: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Power,
    name: 'Prosecutor',
    id: 'mira_prosecutor',
    color: '#B38000',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Prosecutor.png',
    description: 'Prosecutor może wyrzucić wybranego gracza podczas spotkania, zagłuszając wszystkie inne głosy. Może też widzieć, kto na kogo głosował, nawet przy anonimowych głosach.',
    settings: {
        ...probabilityOfAppearing(0),
        'On Wrongful Prosecution': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Eject Prosecutor',
                1: 'Eject Victim, Lose Uses, Eject Both',
                2: 'Eject Both',
            },
        },
        'Max Prosecutions': {
            value: 2,
            type: SettingTypes.Number,
        },
    },
    abilities: [MiraProsecutorAbilities.Prosecute],
};
