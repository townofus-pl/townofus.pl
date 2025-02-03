import {
    probabilityOfAppearing,
    type Role,
    Teams,
    CommonAbilities
} from "@/constants";


export const Radar: Role = {
    "name": "Radar",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/roles/radar.png",
    "description": "Widzi strzałkę wskazującą najbliższego gracza.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};