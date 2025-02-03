import {probabilityOfAppearing, type Role, Teams,} from "@/constants";

export const ButtonBarryAbilities = {
    ButtonBarry: {
        "name": "Button (Naciśnij przycisk)",
        "icon": "/images/abilities/buttonbarry.png",
    },
};

export const ButtonBarry: Role = {
    "name": "Button Barry",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/roles/buttonbarry.png",
    "description": "Może zwołać spotkanie z dowolnego miejsca na mapie.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [ButtonBarryAbilities.ButtonBarry],
};
