import {
    probabilityOfAppearing,
    type Role,
    SettingTypes,
    Teams,
} from "@/constants";

export const RadarAbilities = {
    Radar: {
        "name": "Radar",
        "icon": "/images/abilities/radar.png",
    },
};

export const Radar: Role = {
    "name": "Radar",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/roles/radar.png",
    "description": "Widzi strzałkę wskazującą najbliższego gracza.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [RadarAbilities.Radar],
};