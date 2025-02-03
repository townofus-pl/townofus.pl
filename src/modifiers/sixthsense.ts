import {
    probabilityOfAppearing,
    type Role,
    SettingTypes,
    Teams,
    CommonAbilities
} from "@/constants";

export const SixthSenseAbilities = {
    SixthSense: {
        "name": "Sixth Sense",
        "icon": "/images/abilities/sixthsense.png",
    },
};

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