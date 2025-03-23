import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const EngineerAbilities = {
    FixSabotage: {
        "name": "Fix Sabotage (Napraw Sabotaż)",
        "icon": "/images/abilities/engineer.png"
    }
};

export const Engineer: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Engineer",
    "id": "engineer",
	"color": "#FFA604",
    "team": Teams.Crewmate,
    "icon": "/images/roles/engineer.png",
    "description": "Crewmate który może używać wentylacji. Może naprawiać sabotaże z dowolnego miejsca na mapie.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Maximum Number Of Fixes": {
            value: 5,
            type: SettingTypes.Number,
        },
    },
    "abilities": [CommonAbilities.Vent, EngineerAbilities.FixSabotage],
    "tip": "Obserwuj graczy siedząc w wentylacji.",
};
