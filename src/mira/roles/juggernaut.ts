import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraJuggernautAbilities = {
    Kill: {
        name: 'Kill (Zabij)',
        icon: '/images/mira/abilities/JuggKillButton.png',
    },
    Vent: {
        name: 'Vent (Wejdź do wentylacji)',
        icon: '/images/mira/abilities/JuggVentButton.png',
    },
};

export const MiraJuggernaut: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Juggernaut',
    id: 'mira_juggernaut',
    color: '#8C004D',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Juggernaut.png',
    description: 'Juggernaut wygrywa jako ostatni zabójca i z kazdym zabójstwem skraca sobie cooldown zabijania.',
    settings: {
        ...probabilityOfAppearing(0),
        'Initial Kill Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Kill Cooldown Reduction': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Juggernaut Can Vent': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraJuggernautAbilities.Kill, MiraJuggernautAbilities.Vent],
};

