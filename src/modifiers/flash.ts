import {CommonAbilities, probabilityOfAppearing, type Role, SettingTypes, Teams} from "@/constants";

export const Flash: Role = {
    "name": "Flash",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/modifiers/flash.png",
    "description": "Porusza się z większą prędkością.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Flash Speed': {
            value: 1.25, type: SettingTypes.Multiplier,
        },
    },
    "abilities": [CommonAbilities.None],
};
