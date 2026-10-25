import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing} from '@/constants/settings';
import {MiraCommonAbilities} from '@/mira/abilities';

export const MiraMayor: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Power,
    name: 'Mayor',
    id: 'mira_mayor',
    color: '#660099',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Mayor.png',
    description: 'Politician może ujawnić się jako Mayor podczas spotkania, jeśli skutecznie przeprowadził kampanię wśród przynajmniej połowy żywych Crewmate’ów. Po ujawnieniu jego głos liczy się potrójnie, a jego rola jest widoczna dla wszystkich również w trakcie rundy. Ujawnionego Mayora nie można zabić przez zgadnięcie roli podczas spotkania.',
    settings: {
        ...probabilityOfAppearing(0),
    },
    abilities: [MiraCommonAbilities.None],
};
