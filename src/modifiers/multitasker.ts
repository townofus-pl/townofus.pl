import {CommonAbilities, probabilityOfAppearing, type Role, Teams} from "@/constants";

export const Multitasker: Role = {
    "name": "Multitasker",
    "color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Posiada przejrzyste zadania.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
