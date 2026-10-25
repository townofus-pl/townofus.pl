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
    description: 'Doomsayer wygrywa po poprawnym odgadnięciu wymaganej liczby ról graczy podczas spotkań. Błędne zgadnięcie go nie zabija. Jeśli odpowiednia opcja jest włączona, może obserwować graczy, aby na następnym spotkaniu otrzymać wskazówkę zawężającą listę ich możliwych ról. Zależnie od ustawień wszystkie poprawne zgadnięcia mogą być wymagane podczas jednego spotkania.',
    settings: {
        ...probabilityOfAppearing(0),
        'Observe Cooldown': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Number Of Guesses Needed To Win': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Doomsayer Can Guess Crew Investigative Roles': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Doomsayer Guesses All Roles At Once': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Kill Only The Last Victim': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Doomsayer Can\'t Observe': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Doomsayer Win': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'Ends Game',
                1: 'Leaves In Victory',
                2: 'Nothing',
            },
        },
        'Hide Role On Win Notification': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Doomsayer Continues The Game': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraDoomsayerAbilities.Observe, MiraDoomsayerAbilities.Guess],
};

