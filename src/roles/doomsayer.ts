import {CommonAbilities, probabilityOfAppearing, type Role, Teams} from "@/constants";

export const Doomsayer: Role = {
    "name": "Doomsayer",
    "color": "#00d96d",
    "team": Teams.Neutral,
    "icon": "/images/roles/doomsayer.png",
    "description": "soon",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
