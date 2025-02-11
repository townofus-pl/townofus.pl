import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Diseased: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Diseased",
    "id": "diseased",
	"color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Gdy umrze, czas odnowienia zabójstwa zabójcy wydłuża się.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Deceased Kill Multiplier': {
            value: 3, type: SettingTypes.Multiplier,
        },
    },
    "abilities": [CommonAbilities.None],
};
