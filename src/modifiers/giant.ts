import {CommonAbilities, probabilityOfAppearing, type Role, SettingTypes, Teams} from "@/constants";

export const Giant: Role = {
    "name": "Giant",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/modifiers/giant.png",
    "description": "Jest gigantyczny i porusza się wolniej.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Giant Speed': {
            value: 0.75, type: SettingTypes.Multiplier,
        },
    },
    "abilities": [CommonAbilities.None],
};
