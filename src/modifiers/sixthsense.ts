import {
    probabilityOfAppearing,
    type Role,
    Teams,
    CommonAbilities
} from "@/constants";



export const SixthSense: Role = {
    "name": "Sixth Sense",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/roles/sixthsense.png",
    "description": "Widzi kto używa na nim interakcji.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};