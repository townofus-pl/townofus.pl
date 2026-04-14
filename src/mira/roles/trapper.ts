import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraTrapperAbilities = {
    Trap: {
        name: 'Trap (Pułapka)',
        icon: '/images/mira/abilities/TrapButton.png',
    },
};

export const MiraTrapper: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Investigative,
    name: 'Trapper',
    id: 'mira_trapper',
    color: '#A7D1B3',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Trapper.png',
    description: 'Trapper rozstawia pułapki na mapie i zbiera informacje o rolach graczy, którzy w nie wejdą. Wyniki pojawiają się na następnym spotkaniu w losowej kolejności.',
    settings: {
        ...probabilityOfAppearing(0),
        'Trap Cooldown': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Min Amount Of Time In Trap To Register': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Max Number Of Traps': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Trap Size': {
            value: 0.25,
            type: SettingTypes.Multiplier,
        },
        'Traps Removed After Each Round': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Get More Uses From Completing Tasks': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Minimum Number Of Roles Required To Trigger Trap': {
            value: 3,
            type: SettingTypes.Number,
        },
    },
    abilities: [MiraTrapperAbilities.Trap],
    tip: 'Rozstawiaj pułapki w miejscach dużego ruchu albo pod nieruchomymi graczami, gdy chcesz zawęzić możliwe role podejrzanych.',
};
