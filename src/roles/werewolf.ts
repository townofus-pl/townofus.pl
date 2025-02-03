import {
    CommonAbilities,
    probabilityOfAppearing,
    SettingTypes,
    Teams,
    type Role,
} from "@/constants";

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
            type: SettingTypes.Time,
        },
        'Rampage Duration': {
            value: 22.5,
            type: SettingTypes.Time,
        },
        'Rampage Kill Cooldown': {
            value: 7,
            type: SettingTypes.Time,
        },
        "Werewolf Can Vent When Rampaged": {
            value: 0,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.Kill, WerewolfAbilities.Rampage],
};
