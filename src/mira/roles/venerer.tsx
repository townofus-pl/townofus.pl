import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import { MiraCommonAbilities } from '../abilities';

export const MiraVenererAbilities = {
    Camouflage: {
        name: 'Camouflage',
        icon: '/images/mira/abilities/CamouflageButton.png',
    },
    Sprint: {
        name: 'Sprint',
        icon: '/images/mira/abilities/CamoSprintButton.png',
    },
    Freeze: {
        name: 'Freeze',
        icon: '/images/mira/abilities/CamoSprintFreezeButton.png',
    },
};

export const MiraVenerer: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Concealing,
    name: 'Venerer',
    id: 'mira_venerer',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Venerer.png',
    "description": (<>
            <p>
            Venerer odblokowuje trzy kolejne umiejętności wraz z kolejnymi zabójstwami, a każda z nich działa jako osobny efekt.
            </p>
            <ul>
            <li>Po swoim pierwszym zabójstwie, Venerer może się zakamuflować.</li>
            <li>Po drugim zabójstwie, Venerer może szybciej biegać.</li>
            <li>Po trzecim zabójstwie, po aktywowaniu zdolności, wszyscy gracze wokół Venerera są spowolnieni. Im bliżej Venerera, tym większe spowolnienie.</li>
            </ul>
            <p>
            Wszystkie zdolności są aktywowane jednym przyciskiem i mają tę samą długość trwania.
            </p>
        </>),    settings: {
        ...probabilityOfAppearing(0),
        'Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Sprint Speed': {
            value: 1.25,
            type: SettingTypes.Multiplier,
        },
        'Min Freeze Speed': {
            value: 0.25,
            type: SettingTypes.Multiplier,
        },
        'Freeze Radius': {
            value: 1,
            type: SettingTypes.Multiplier,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent, MiraVenererAbilities.Camouflage, MiraVenererAbilities.Sprint, MiraVenererAbilities.Freeze],
};
