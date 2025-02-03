import {
    probabilityOfAppearing,
    type Role,
    SettingTypes,
    Teams,
    CommonAbilities
} from "@/constants";

export const MultitaskerAbilities = {
    Multitasker: {
        "name": "Multitasker",
        "icon": "/images/abilities/multitasker.png",
    },
};

export const Multitasker: Role = {
    "name": "Multitasker",
    "color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/roles/multitasker.png",
    "description": "Posiada przejrzyste zadania.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};