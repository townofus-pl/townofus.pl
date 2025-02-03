import {
    probabilityOfAppearing,
    type Role,
    SettingTypes,
    Teams,
    CommonAbilities
} from "@/constants";

export const LoversAbilities = {
    Lovers: {
        "name": "Lovers",
        "icon": "/images/abilities/lovers.png",
    },
};

export const Lovers: Role = {
    "name": "Lovers",
    "color": "#FF69B4",
    "team": Teams.All,
    "icon": "/images/roles/lovers.png",
    "description": "Para graczy połączona ze sobą, wygrywająca razem.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Both Lovers Die': {
            value: true, type: SettingTypes.Boolean,
        },
        'Loving Impostor Probability': {
            value: 20, type: SettingTypes.Percentage,
        },
        'Neutral Rolec Can Be Lovers': {
            value: true, type: SettingTypes.Boolean,
        },
        'Impostor Lover Can Kill Teammate': {
            value: false, type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.None],
};