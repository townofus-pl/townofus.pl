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
    description: 'Mayor może ujawnić się podczas spotkania po skutecznym przekonaniu połowy załogi jako Politician. Po ujawnieniu zyskuje 3 głosy, a jego rola jest widoczna dla wszystkich w trakcie rundy.',
    settings: {
        ...probabilityOfAppearing(0),
    },
    abilities: [MiraCommonAbilities.None],
};
