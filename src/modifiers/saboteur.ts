import {CommonAbilities, probabilityOfAppearing, type Role, SettingTypes, Teams} from "@/constants";

export const Saboteur: Role = {
    "name": "Saboteur",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Ma zmniejszony cooldown na sabotaże.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Reduced Sabotage Bonus': {
            value: 10, type: SettingTypes.Time,
        },
    },
    "abilities": [CommonAbilities.None],
};
