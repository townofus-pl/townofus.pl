import {
    probabilityOfAppearing,
    type Role,
    Teams,
    CommonAbilities
} from "@/constants";


export const DoubleShot: Role = {
    "name": "Double Shot",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/doubleshot.png",
    "description": "Otrzymuje dodatkowe życie podczas zestrzelenia.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};