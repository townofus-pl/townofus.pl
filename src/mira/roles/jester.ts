import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraJesterAbilities = {
    Vent: {
        name: 'Vent (Schowaj sie)',
        icon: '/images/mira/abilities/JesterVentButton.png',
    },
    Haunt: {
        name: 'Haunt (Nawiedz)',
        icon: '/images/mira/abilities/JesterHauntButton.png',
    },
};

export const MiraJester: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Evil,
    name: 'Jester',
    id: 'mira_jester',
    color: '#FFBFCC',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Jester.png',
    description: 'Jester wygrywa, jeśli zostanie wyrzucony na spotkaniu.',
    settings: {
        ...probabilityOfAppearing(0),
        'Can Use Button': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Hide in Vents': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Has Impostor Vision': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Survivor Scatter Mechanic Enabled': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Survivor Scatter Timer': {
            value: 25,
            type: SettingTypes.Time,
        },
        'After Win Type': {
            value: 'Ends Game',
            type: SettingTypes.Text,
            description: {
                0: 'Ends Game',
                1: 'Haunts',
                2: 'Nothing',
            },
        },
    },
    abilities: [MiraJesterAbilities.Vent, MiraJesterAbilities.Haunt],
};

