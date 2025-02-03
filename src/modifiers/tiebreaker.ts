import {CommonAbilities, probabilityOfAppearing, type Role, Teams} from "@/constants";


export const Tiebreaker: Role = {
    "name": "Tiebreaker",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/roles/tiebreaker.png",
    "description": "Jego głos rozstrzyga remisy podczas głosowania.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
