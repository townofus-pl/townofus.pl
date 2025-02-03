import {CommonAbilities, probabilityOfAppearing, type Role, SettingTypes, Teams,} from "@/constants";

export const Diseased: Role = {
    "name": "Diseased",
    "color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Wydłuża czas odnowienia zabójstwa zabójcy po śmierci.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Deceased Kill Multiplier': {
            value: 3, type: SettingTypes.Multiplier,
        },
    },
    "abilities": [CommonAbilities.None],
};
