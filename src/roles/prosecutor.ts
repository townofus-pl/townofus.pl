import {probabilityOfAppearing, SettingTypes, Teams, type Role} from "@/constants";

export const ProsecutorAbilities = {
    Prosecute: {
        "name": "Prosecute (Oskarż)",
        "icon": "/images/abilities/prosecute.png"
    },
};

export const Prosecutor: Role = {
    "name": "Prosecutor",
    "color": "#B38000",
    "team": Teams.Crewmate,
    "icon": "/images/roles/prosecutor.png",
    "description": "Crewmate, który raz na grę może oskarżyć gracza, co skutkuje jego wygnaniem w danym spotkaniu. Prosecutor również widzi głosy w sposób jawny, nieanonimowy.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Prosecutor Dies When Tey Exile A Crewmate": {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [ProsecutorAbilities.Prosecute],
};
