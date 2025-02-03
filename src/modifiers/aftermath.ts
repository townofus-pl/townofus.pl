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
    "description": "Zmusza zabójcę do użycia jego zdolności po śmierci.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};