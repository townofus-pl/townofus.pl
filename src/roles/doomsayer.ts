import {CommonRoleAbilities, probabilityOfAppearing, type Role, Teams} from "./shared";

export const Doomsayer: Role = {
    "name": "Doomsayer",
    "color": "#00d96d",
    "team": Teams.Neutral,
    "icon": "/images/roles/doomsayer.png",
    "description": "soon",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonRoleAbilities.None],
};
