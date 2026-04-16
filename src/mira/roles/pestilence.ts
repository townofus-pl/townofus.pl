import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraPestilenceAbilities = {
    Kill: {
        name: 'Kill (Zabij)',
        icon: '/images/mira/abilities/PestKillButton.png',
    },
    Vent: {
        name: 'Vent (Wejdź do wentylacji)',
        icon: '/images/mira/abilities/PestVentButton.png',
    },
};

export const MiraPestilence: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Pestilence',
    id: 'mira_pestilence',
    color: '#606870',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Pestilence.png',
    description: 'Pestilence wygrywa jako ostatni zabójca. Pestilence to nieśmiertelna siła, która zyskuje zdolność zabijania i można ją zabić tylko przez głosowanie. Nawet śmierć Loversa nie zabije Pestilence.',
    settings: {
        ...probabilityOfAppearing(0),
        'Pestilence Kill Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Pestilence Can Vent': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Instant Pestilence Chance': {
            value: 0,
            type: SettingTypes.Percentage,
        },
        'Announce Pestilence Transformation': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraPestilenceAbilities.Kill, MiraPestilenceAbilities.Vent],
};

