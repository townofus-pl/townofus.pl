import {
    probabilityOfAppearing,
    type Role,
    SettingTypes,
    Teams,
    CommonAbilities,
} from "@/constants";

export const DiseasedAbilities = {
    Diseased: {
        "name": "Diseased",
        "icon": "/images/abilities/diseased.png",
    },
};

export const Diseased: Role = {
    "name": "Diseased",
    "color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/roles/diseased.png",
    "description": "Wydłuża czas odnowienia zabójstwa zabójcy po śmierci.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Deceased Kill Multiplier': {
            value: 3, type: SettingTypes.Multiplier,
        },
    },
    "abilities": [CommonAbilities.None],
};