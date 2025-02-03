import {CommonAbilities, probabilityOfAppearing, type Role, SettingTypes, Teams} from "@/constants";

export const Bait: Role = {
    "name": "Bait",
    "color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Zmusza zabójcę do automatycznego zgłoszenia ciała.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Minimum Delay for the Bait Report': {
            value: 0, type: SettingTypes.Time,
        },
        'Maximum Delay for the Bait Report': {
            value: 1, type: SettingTypes.Time,
        },
    },
    "abilities": [CommonAbilities.None],
};
