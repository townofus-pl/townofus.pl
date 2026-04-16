import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '@/mira/abilities';

export const MiraMystic: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Investigative,
    name: 'Mystic',
    id: 'mira_mystic',
    color: '#4D99E6',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Mystic.png',
    description: 'Mystic otrzymuje sygnał, gdy ktoś zginie: niebieski błysk oraz strzałkę wskazującą kierunek śmierci.',
    settings: {
        ...probabilityOfAppearing(0),
        'Arrow Duration': {
            value: 0.05,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraCommonAbilities.None],
    tip: 'Grając Mysticiem, zachowaj spokój i czekaj na zgony, a potem szybko wykorzystuj informacje o kierunku śmierci.',
};
