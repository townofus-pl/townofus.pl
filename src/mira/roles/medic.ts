import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraMedicAbilities = {
    Shield: {
        name: 'Shield (Osłoń)',
        icon: '/images/mira/abilities/MedicButton.png',
    },
};

export const MiraMedic: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Protective,
    name: 'Medic',
    id: 'mira_medic',
    color: '#006400',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Medic.png',
    description: 'Medic może osłonić wybranego gracza tarczą chroniącą go przed zabiciem. Medic widzi zieloną poświatę na ekranie, jeśli ktoś spróbuje zabić jego podopiecznego. Jeśli Medic zgłosi martwe ciało odpowiednio szybko, może otrzymać raport zawierający wskazówki na temat tożsamości Zabójcy. Tarcza znika dopiero po śmierci Medica.',
    settings: {
        ...probabilityOfAppearing(0),
        'Show Shielded Player': {
            value: 'Shielded + Medic',
            type: SettingTypes.Text,
            description: {
                0: 'Shielded + Medic',
                1: 'Medic',
                2: 'Shielded',
                3: 'Everyone',
                4: 'No One',
            },
        },
        'Who Gets Murder Attempt Indicator': {
            value: 'Medic',
            type: SettingTypes.Text,
            description: {
                0: 'Shielded + Medic',
                1: 'Medic',
                2: 'Shielded',
                3: 'Everyone',
                4: 'No One',
            },
        },
        'Can Give Shield Away Next Round': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Max Amount of Shield Uses': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Shield Breaks on Murder Attempt': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Show Reports in Chat': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Time Where Medic Will Have Name': {
            value: 0,
            type: SettingTypes.Time,
        },
        'Time Where Medic Will Have Color Type': {
            value: 15,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraMedicAbilities.Shield],
};
