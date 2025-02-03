import {CommonAbilities, probabilityOfAppearing, type Role, Teams} from "@/constants";

export const DoubleShot: Role = {
    "name": "Double Shot",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Otrzymuje dodatkowe życie podczas zestrzelenia.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
