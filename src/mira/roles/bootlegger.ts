import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import { MiraCommonAbilities } from '../abilities';

export const MiraBootleggerAbilities = {
    Roleblock: {
        name: 'Roleblock (Zablokuj rolę)',
        icon: '/images/mira/abilities/WineRoleblockButton.png',
    },
    Sicken: {
        name: 'Sicken (Podtruj)',
        icon: '/images/mira/abilities/WineSickenButton.png',
    },
    Poison: {
        name: 'Poison (Zatruj)',
        icon: '/images/mira/abilities/WinePoisonButton.png',
    },
};

export const MiraBootlegger: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Support,
    name: 'Bootlegger',
    id: 'mira_bootlegger',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Bootlegger.png',
    description: 'Bootlegger może pić z innymi, aby zablokować ich role, tymczasowo wyłączając ich zdolności. Gdy gracz zostanie zablokowany trzy razy, umrze na skutek zatrucia!',
    settings: {
        ...probabilityOfAppearing(0),
        'Roleblock Cooldown': {
            value: 22.5,
            type: SettingTypes.Time,
        },
        'Minimum Roleblock Delay': {
            value: 1.5,
            type: SettingTypes.Time,
        },
        'Maximum Roleblock Delay': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Poison Triggers On': {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: 'Delay End',
                1: 'Meeting Start',
                2: 'Meeting End',
            },
        },
        'Poison Delay': {
            value: 15,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent, MiraBootleggerAbilities.Roleblock, MiraBootleggerAbilities.Sicken, MiraBootleggerAbilities.Poison],
};
