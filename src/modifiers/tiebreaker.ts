import {
    probabilityOfAppearing,
    type Role,
    SettingTypes,
    Teams,
    CommonAbilities
} from "@/constants";

export const TiebreakerAbilities = {
    Tiebreaker: {
        "name": "Tiebreaker",
        "icon": "/images/abilities/tiebreaker.png",
    },
};

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