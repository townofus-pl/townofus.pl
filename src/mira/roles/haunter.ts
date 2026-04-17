import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '@/mira/abilities';

export const MiraHaunter: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Afterlife,
    name: 'Haunter',
    id: 'mira_haunter',
    color: '#D4D4D4',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Haunter.png',
    description: 'Haunter to duch członka załogi, który musi ukończyć wszystkie zadania i nie dać się złapać, aby ujawnić Impostorów żywym graczom. Gdy liczba pozostałych zadań spadnie do określonego progu, Impostorzy otrzymują alert i poznają pozycję Hauntera. Haunter musi dotrwać do następnego spotkania, nie dając się kliknąć.',
    settings: {
        ...probabilityOfAppearing(0),
        'Tasks Left Before Clickable': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Tasks Left Before Alerted': {
            value: 1,
            type: SettingTypes.Number,
        },
        'Reveal Neutral Roles': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Can Be Clicked By': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'Everyone',
                1: 'Non-Crew',
                2: 'Imps Only',
            },
        },
    },
    abilities: [MiraCommonAbilities.None],
    tip: 'Aby zmniejszyć ryzyko bycia klikniętym, najpierw domykaj długie taski i łącz zadania położone blisko siebie.',
};
