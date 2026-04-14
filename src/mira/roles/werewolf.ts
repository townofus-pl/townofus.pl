import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraWerewolfAbilities = {
    Rampage: {
        name: 'Rampage',
        icon: '/images/mira/abilities/RampageButton.png',
    },
    Kill: {
        name: 'Kill (podczas Rampage)',
        icon: '/images/mira/abilities/WolfKillButton.png',
    },
    Vent: {
        name: 'Vent (podczas Rampage)',
        icon: '/images/mira/abilities/WolfVentButton.png',
    },
};

export const MiraWerewolf: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Werewolf',
    id: 'mira_werewolf',
    color: '#A86629',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Werewolf.png',
    description: 'Werewolf wygrywa jako ostatni zabójca. Może wejść w Rampage i wykonywać wiele zabójstw w krótkim czasie.',
    settings: {
        ...probabilityOfAppearing(0),
        'Rampage Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Rampage Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Rampage Kill Cooldown': {
            value: 1.5,
            type: SettingTypes.Time,
        },
        'Werewolf Can Vent When Rampaged': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraWerewolfAbilities.Rampage, MiraWerewolfAbilities.Kill, MiraWerewolfAbilities.Vent],
};

