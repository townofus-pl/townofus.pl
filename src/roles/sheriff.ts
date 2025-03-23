import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Sheriff: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Sheriff",
    "id": "sheriff",
	"color": "#FFFF00",
    "team": Teams.Crewmate,
    "icon": "/images/roles/sheriff.png",
    "description": "Crewmate, który posiada umiejętność zabijania ról Impostorskich, Neutralnych zabijających oraz Neutralnych złych. Jeśli spróbujesz zabić niewinnego gracza, umrzesz.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Sheriff Miskill Kills Crewmate": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Sheriff Kills Neutral Evil Roles": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Sheriff Kills Neutral Killing Roles": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Sheriff Kill Cooldown": {
            value: 25,
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
