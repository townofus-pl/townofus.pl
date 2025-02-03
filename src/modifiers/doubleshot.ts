import {
    probabilityOfAppearing,
    type Role,
    SettingTypes,
    Teams,
} from "@/constants";

export const DoubleShotAbilities = {
    DoubleShot: {
        "name": "Double Shot",
        "icon": "/images/abilities/doubleshot.png",
    },
};

export const DoubleShot: Role = {
    "name": "Double Shot",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/doubleshot.png",
    "description": "Otrzymuje dodatkowe życie podczas zestrzelenia.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [DoubleShotAbilities.DoubleShot],
};