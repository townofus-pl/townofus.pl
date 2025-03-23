import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const SwooperAbilities = {
    Swoop: {
        "name": "Swoop (Stań się niewidzialny)",
        "icon": "/images/abilities/swoop.png"
    },
};

export const Swooper: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Swooper",
    "id": "swooper",
	"color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/swooper.png",
    "description": "Impostor, który może chwilowo stać się niewidzialny.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Swoop Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Swoop Duration": {
            value: 10,
            type: SettingTypes.Time,
        },
        "Swooper Can Vent": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Sabotage, SwooperAbilities.Swoop],
};
