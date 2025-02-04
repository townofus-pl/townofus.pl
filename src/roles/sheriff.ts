import {CommonAbilities, probabilityOfAppearing, SettingTypes, Teams, type Role} from "@/constants";

export const Sheriff: Role = {
    "name": "Sheriff",
    "color": "#FFFF00",
    "team": Teams.Crewmate,
    "icon": "/images/roles/sheriff.png",
    "description": "Crewmate, który posiada umiejętność zabijania ról Impostorskich, Neutralnych zabijających oraz Neutralnych złych. Jeśli spróbujesz zabić niewinnego gracza, umrzesz.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Sheriff Miskill Kills Crewmate": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Sheriff Kills Neutral Evil Roles": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Sheriff Kills Neutral Killing Roles": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "R": {
            value: 22.5,
            type: SettingTypes.Time,
        },
        "Sheriff Can Report Who They've Killed": {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.Kill],
    "tip": "Nie zabijaj, jeżeli nie masz żadnych podejrzeń. Twoje życie jest zbyt cenne."
};
