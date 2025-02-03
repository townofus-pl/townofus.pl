import {CommonAbilities, probabilityOfAppearing, type Role, SettingTypes, Teams,} from "@/constants";

export const EngineerAbilities = {
    FixSabotage: {
        "name": "Fix Sabotage (Napraw Sabotaż)",
        "icon": "/images/abilities/engineer.png"
    }
};

export const Engineer: Role = {
    "name": "Engineer",
    "color": "#FFA604",
    "team": Teams.Crewmate,
    "icon": "/images/roles/engineer.png",
    "description": "Crewmate który może używać wentylacji. Może naprawiać sabotaże z dowolnego miejsca na mapie.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Maximum Number Of Fixes": {
            value: 3,
            type: SettingTypes.Number,
        },
    },
    "abilities": [CommonAbilities.Vent, EngineerAbilities.FixSabotage],
    "tip": "Obserwuj graczy siedząc w wentylacji.",
};
