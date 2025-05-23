import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const WerewolfAbilities = {
    Rampage: {
        "name": "Rampage (Szał)",
        "icon": "/images/abilities/rampage.png"
    }
}

export const Werewolf: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Werewolf",
    "id": "werewolf",
	"color": "#8F4C18",
    "team": Teams.Neutral,
    "icon": "/images/roles/werewolf.png",
    "description": "Neutralna rola z własnym warunkiem zwycięstwa. Choć posiada przycisk zabijania, nie może go używać, dopóki nie przejdzie w stan Szału. Gdy to nastąpi, zyskuje pole widzenia Impostora oraz możliwość zabijania. Jednak w przeciwieństwie do większości zabójców, jego czas odnowienia zabójstwa jest bardzo krótki. Aby wygrać, Werewolf musi być ostatnim żyjącym zabójcą.",
    "settings": {
        ...probabilityOfAppearing(0),
        'Rampage Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Rampage Duration': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Rampage Kill Cooldown': {
            value: 10,
            type: SettingTypes.Time,
        },
        "Werewolf Can Vent When Rampaged": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Vent, WerewolfAbilities.Rampage],
};
