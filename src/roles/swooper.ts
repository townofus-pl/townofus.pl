import {CommonAbilities, probabilityOfAppearing, SettingTypes, Teams, type Role} from "@/constants";

export const SwooperAbilities = {
    Swoop: {
        "name": "Swoop (Stań się niewidzialny)",
        "icon": "/images/abilities/swoop.png"
    },
};

export const Swooper: Role = {
    "name": "Swooper",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/swooper.png",
    "description": "Impostor, który może chwilowo stać się niewidzialny.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Swoop Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Swoop Duration": {
            value: 10,
            type: SettingTypes.Time,
        },
        "Swooper Can Vent": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Sabotage, SwooperAbilities.Swoop],
};
