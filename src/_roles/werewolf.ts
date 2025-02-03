import {
    CommonRoleAbilities,
    probabilityOfAppearing,
    RoleSettingTypes,
    Teams,
    type Role,
} from "./shared";

export const WerewolfAbilities = {
    Rampage: {
        "name": "Rampage (Szał)",
        "icon": "/images/abilities/rampage.png"
    }
}

export const Werewolf: Role = {
    "name": "Werewolf",
    "color": "#8F4C18",
    "team": Teams.Crewmate,
    "icon": "/images/roles/werewolf.png",
    "description": "Neutralna rola z własnym warunkiem zwycięstwa. Choć posiada przycisk zabijania, nie może go używać, dopóki nie przejdzie w stan Szału. Gdy to nastąpi, zyskuje pole widzenia Impostora oraz możliwość zabijania. Jednak w przeciwieństwie do większości zabójców, jego czas odnowienia zabójstwa jest bardzo krótki. Aby wygrać, Werewolf musi być ostatnim żyjącym zabójcą.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Rampage Cooldown': {
            value: 30,
            type: RoleSettingTypes.Time,
        },
        'Rampage Duration': {
            value: 22.5,
            type: RoleSettingTypes.Time,
        },
        'Rampage Kill Cooldown': {
            value: 7,
            type: RoleSettingTypes.Time,
        },
        "Werewolf Can Vent When Rampaged": {
            value: 0,
            type: RoleSettingTypes.Boolean,
        },
    },
    "abilities": [CommonRoleAbilities.Kill, WerewolfAbilities.Rampage],
};
