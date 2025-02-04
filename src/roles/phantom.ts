import {CommonAbilities, probabilityOfAppearing, SettingTypes, Teams, type Role} from "@/constants";

export const Phantom: Role = {
    "name": "Phantom",
    "color": "#662966",
    "team": Teams.Neutral,
    "icon": "/images/roles/phantom.png",
    "description": "soon",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
