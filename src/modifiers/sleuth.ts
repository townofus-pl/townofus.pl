import {
    probabilityOfAppearing,
    type Role,
    SettingTypes,
    Teams,
    CommonAbilities
} from "@/constants";

export const SleuthAbilities = {
    Sleuth: {
        "name": "Sleuth",
        "icon": "/images/abilities/sleuth.png",
    },
};

export const Sleuth: Role = {
    "name": "Sleuth",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/roles/sleuth.png",
    "description": "Widzi role zgłoszonych ciał podczas spotkań.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};