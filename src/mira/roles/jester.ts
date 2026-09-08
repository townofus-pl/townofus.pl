import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraJesterAbilities = {
    Vent: {
        name: 'Vent (Wejdź do wentylacji)',
        icon: '/images/mira/abilities/JesterVentButton.png',
    },
    Haunt: {
        name: 'Haunt (Nawiedź)',
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
    description: 'Jester wygrywa, jeśli zostanie wyrzucony na spotkaniu. Jeżeli ustawiono odpowiednią opcję: Po wygranej Jester może zabić jedną z osób, które na niego zagłosowały.',
    settings: {
        ...probabilityOfAppearing(0),
        'Can Use Button': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Hide In Vents': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Vent Cooldown': {
            value: 15,
            type: SettingTypes.Time,
        },
        'Vent Duration': {
            value: 45,
            type: SettingTypes.Time,
        },
        'Can Poke Others': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Poke Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Has Impostor Vision': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Scatter Mechanic Enabled': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Scatter Timer': {
            value: 25,
            type: SettingTypes.Time,
        },
        'After Win Type': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Ends Game',
                1: 'Haunts',
                2: 'Nothing',
            },
        },
        'Notify Others On Win': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraJesterAbilities.Vent, MiraJesterAbilities.Haunt],
};

