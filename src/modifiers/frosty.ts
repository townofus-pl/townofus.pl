import {CommonAbilities, probabilityOfAppearing, type Role, SettingTypes, Teams} from "@/constants";

export const Frosty: Role = {
    "name": "Frosty",
    "color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/modifiers/frosty.png",
    "description": "Spowalnia zabójcę po śmierci.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Chill Duration': {
            value: 10, type: SettingTypes.Time,
        },
        'Chill Start Speed': {
            value: 0.75, type: SettingTypes.Multiplier,
        },
    },
    "abilities": [CommonAbilities.None],
};
