import {
    probabilityOfAppearing,
    type Role,
    SettingTypes,
    Teams,
    CommonAbilities
} from "@/constants";

// Crewmate Modifiers
export const AftermathAbilities = {
    Aftermath: {
        "name": "Aftermath",
        "icon": "/images/abilities/aftermath.png",
    },
};

export const Aftermath: Role = {
    "name": "Aftermath",
    "color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/roles/aftermath.png",
    "description": "Zmusza zabójcę do użycia jego zdolności po śmierci (np. Blackmailer po zabiciu Aftermath zostaje sam zblackmailowany na kolejne głosowanie).",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};