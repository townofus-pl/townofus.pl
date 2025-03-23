import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Warlock: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Warlock",
    "id": "warlock",
	"color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/warlock.png",
    "description": "Impostor, który może ładować manę. Gdy naładuje ją do 100%, może zabić wielu graczy bez cooldownu, pod warunkiem że zrobi to w jednej sekundzie. Warlock nie musi w pełni naładować many, aby móc zabijać, bez naładowanej many zabija jak zwykły impostor.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Time It Takes To Fully Charge": {
            value: 25.0,
            type: SettingTypes.Time,
        },
        "Time It Takes To Use Full Charge": {
            value: 1.0,
            type: SettingTypes.Time,
        },

    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Vent, CommonAbilities.Sabotage],
};
