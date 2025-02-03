import {
    probabilityOfAppearing,
    type Role,
    SettingTypes,
    Teams,
    CommonAbilities
} from "@/constants";

export const MiniAbilities = {
    Mini: {
        "name": "Mini",
        "icon": "/images/abilities/mini.png",
    },
};

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