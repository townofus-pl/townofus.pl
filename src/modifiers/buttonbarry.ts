import {probabilityOfAppearing, type Role, Teams,} from "@/constants";

export const ButtonBarryAbilities = {
    ButtonBarry: {
        "name": "Button (Naciśnij przycisk)",
        "icon": "/images/abilities/button.png",
    },
};

export const ButtonBarry: Role = {
    "name": "Button Barry",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Może zwołać spotkanie z dowolnego miejsca na mapie.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [ButtonBarryAbilities.ButtonBarry],
};
