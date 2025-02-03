import {
    probabilityOfAppearing,
    type Role,
    SettingTypes,
    Teams,
} from "@/constants";

export const ShyAbilities = {
    Shy: {
        "name": "Shy",
        "icon": "/images/abilities/shy.png",
    },
};

export const Shy: Role = {
    "name": "Shy",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/roles/shy.png",
    "description": "Staje się przeźroczysty gdy się nie rusza.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Transparency Delay': {
            value: 0, type: SettingTypes.Time,
        },
        'Turn Transparent Duration': {
            value: 0, type: SettingTypes.Time,
        },
        'Final Opacity': {
            value: 10, type: SettingTypes.Percentage,
        },
    },
    "abilities": [ShyAbilities.Shy],
};