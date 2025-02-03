import {CommonAbilities, probabilityOfAppearing, type Role, Teams} from "@/constants";

export const SixthSense: Role = {
    "name": "Sixth Sense",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Widzi kto używa na nim interakcji.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
