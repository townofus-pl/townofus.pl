import {CommonAbilities, probabilityOfAppearing, type Role, Teams} from "@/constants";


export const Mini: Role = {
    "name": "Mini",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/roles/mini.png",
    "description": "Jest mały.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
