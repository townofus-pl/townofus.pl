import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraSoulCollectorAbilities = {
    Reap: {
        name: 'Reap (Zbierz żniwa)',
        icon: '/images/mira/abilities/ReapButton.png',
    },
    Vent: {
        name: 'Vent (Wentylacja)',
        icon: '/images/mira/abilities/ReaperVentButton.png',
    },
};

export const MiraSoulCollector: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Soul Collector',
    id: 'mira_soul_collector',
    color: '#99FFCC',
    team: Teams.Neutral,
    icon: '/images/mira/roles/SoulCollector.png',
    description: 'Soul Collector wygrywa jako ostatni zabójca. Zabija graczy bez zostawiania ciał, zamiast tego pozostaje dusza której nie można zreportować.',
    settings: {
        ...probabilityOfAppearing(0),
        'Reap Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Soul Collector Can Vent': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraSoulCollectorAbilities.Reap, MiraSoulCollectorAbilities.Vent],
};

