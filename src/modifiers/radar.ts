import {CommonAbilities, probabilityOfAppearing, type Role, Teams} from "@/constants";

export const Radar: Role = {
    "name": "Radar",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Widzi strzałkę wskazującą najbliższego gracza.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
