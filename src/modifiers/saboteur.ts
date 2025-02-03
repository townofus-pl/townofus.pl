import {
    probabilityOfAppearing,
    type Role,
    SettingTypes,
    Teams,
    CommonAbilities
} from "@/constants";

export const SaboteurAbilities = {
    Saboteur: {
        "name": "Saboteur",
        "icon": "/images/abilities/saboteur.png",
    },
};

export const Saboteur: Role = {
    "name": "Saboteur",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/saboteur.png",
    "description": "Ma zmniejszony cooldown na sabotaże.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Reduced Sabotage Bonus': {
            value: 10, type: SettingTypes.Time,
        },
    },
    "abilities": [CommonAbilities.None],
};