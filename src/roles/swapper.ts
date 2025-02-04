import {probabilityOfAppearing, SettingTypes, Teams, type Role} from "@/constants";

export const SwapperAbilities = {
    Swap: {
        "name": "Swap (Zamień)",
        "icon": "/images/abilities/swapperswitch.png"
    },
};

export const Swapper: Role = {
    "name": "Swapper",
    "color": "#66E666",
    "team": Teams.Crewmate,
    "icon": "/images/roles/swapper.png",
    "description": "Crewmate, który podczas spotkania może zamienić głosy między dwoma graczami. Wszystkie głosy oddane na pierwszego gracza zostaną przeniesione na drugiego i odwrotnie.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Swapper Can Button": {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [SwapperAbilities.Swap],
};
