import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraDoomsayerAbilities = {
    Observe: {
        name: 'Observe (Obserwuj)',
        icon: '/images/mira/abilities/ObserveButton.png',
    },
    Guess: {
        name: 'Guess (Zgaduj)',
        icon: '/images/mira/abilities/Guess.png',
    },
};

export const MiraDoomsayer: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Evil,
    name: 'Doomsayer',
    id: 'mira_doomsayer',
    color: '#00FF80',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Doomsayer.png',
    description: 'Doomsayer wygrywa przez poprawne zgadywanie ról graczy i może obserwować cele, by dostać zawężoną listę podejrzeń.',
    settings: {
        ...probabilityOfAppearing(0),
        'Observe Cooldown': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Number of Guesses Needed to Win': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Doomsayer Can Guess Crew Investigative Roles': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Doomsayer Guesses All Roles at Once': {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Doomsayer Can't Observe": {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Doomsayer Win': {
            value: 'Leaves in Victory',
            type: SettingTypes.Text,
            description: {
                0: 'Leaves in Victory',
                1: 'Ends Game',
                2: 'Nothing',
            },
        },
    },
    abilities: [MiraDoomsayerAbilities.Observe, MiraDoomsayerAbilities.Guess],
};

