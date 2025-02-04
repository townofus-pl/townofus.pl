import {probabilityOfAppearing, type Role, SettingTypes, Teams,} from "@/constants";

export const DisperserAbilities = {
    Disperser: {
        "name": "Disperser",
        "icon": "/images/abilities/disperse.png",
    },
};

export const Disperser: Role = {
    "name": "Disperser",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/modifiers/disperse.png",
    "description": "Może jednorazowo wysłać wszystkich do losowych ventów.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Uses': {
            value: 1, type: SettingTypes.Number,
        },
    },
    "abilities": [DisperserAbilities.Disperser],
};
