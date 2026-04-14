import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing} from '@/constants/settings';

export const MiraDeputyAbilities = {
    Camp: {
        name: 'Camp (Pilnuj)',
        icon: '/images/mira/abilities/CampButton.png',
    },
    Shoot: {
        name: 'Shoot (Strzał)',
        icon: '/images/mira/abilities/Shoot.png',
    },
};

export const MiraDeputy: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Deputy',
    id: 'mira_deputy',
    color: '#FFCC00',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Deputy.png',
    description: 'Deputy może oznaczyć gracza zdolnością Camp. Gdy oznaczony gracz zginie, Deputy dostaje czerwony alert. Na kolejnym spotkaniu może spróbować zastrzelić zabójcę oznaczonego gracza.',
    settings: {
        ...probabilityOfAppearing(0),
    },
    abilities: [MiraDeputyAbilities.Camp, MiraDeputyAbilities.Shoot],
};
