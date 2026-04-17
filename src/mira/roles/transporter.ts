import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraTransporterAbilities = {
    Transport: {
        name: 'Transport (Transportuj)',
        icon: '/images/mira/abilities/TransportButton.png',
    },
};

export const MiraTransporter: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Support,
    name: 'Transporter',
    id: 'mira_transporter',
    color: '#00EDFF',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Transporter.png',
    description: 'Transporter może zamieniać miejscami dwóch graczy, żywych lub martwych.',
    settings: {
        ...probabilityOfAppearing(0),
        'Transport Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Max Uses': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Move While Using Transport Menu (KB ONLY)': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Use Vitals': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Get More Uses From Completing Tasks': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraTransporterAbilities.Transport],
};
