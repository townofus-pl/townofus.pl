import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraLookoutAbilities = {
    Watch: {
        name: 'Watch (Obserwuj)',
        icon: '/images/mira/abilities/WatchButton.png',
    },
};

export const MiraLookout: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Investigative,
    name: 'Lookout',
    id: 'mira_lookout',
    color: '#33FF66',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Lookout.png',
    description: 'Lookout może obserwować graczy podczas rund i podczas spotkania dowiaduje się, które role wchodziły w interakcje z obserwowanymi celami.',
    settings: {
        ...probabilityOfAppearing(0),
        'Watch Cooldown': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Watched Player Feedback Reveals': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'Roles',
                1: 'Players',
            }
        },
        'Initial Players That Can be Watched': {
            value: 5,
            type: SettingTypes.Number,
        },
        'See Indirect Attacks': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Lookout Watches Reset After Each Round': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Task Uses': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraLookoutAbilities.Watch],
    tip: 'Obserwuj graczy często targetowanych przez innych (np. ważne role), bo to ułatwia potwierdzanie ochrony albo wskazywanie zabójcy.',
};
