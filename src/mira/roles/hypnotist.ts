import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraHypnotistAbilities = {
    Hypnotise: {
        name: 'Hypnotise (Hipnotyzuj)',
        icon: '/images/mira/abilities/HypnotiseButton.png',
    },
    MassHysteria: {
        name: 'Mass Hysteria (Masowa histeria)',
        icon: '/images/mira/abilities/HysteriaClean.png',
    },
};

export const MiraHypnotist: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Support,
    name: 'Hypnotist',
    id: 'mira_hypnotist',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Hypnotist.png',
    description: 'Hypnotist może hipnotyzować graczy, a podczas spotkania aktywować Masową histerię, by wywołać różne efekty wizualne w następnej rundzie.',
    settings: {
        ...probabilityOfAppearing(0),
        'Hypnotise Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Hypnotist Can Kill With Teammate': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraHypnotistAbilities.Hypnotise, MiraHypnotistAbilities.MassHysteria],
};
