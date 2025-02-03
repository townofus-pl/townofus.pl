import {CommonAbilities, probabilityOfAppearing, type Role, Teams} from "@/constants";

export const Sleuth: Role = {
    "name": "Sleuth",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Widzi role zgłoszonych ciał podczas spotkań.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
