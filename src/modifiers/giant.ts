import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Giant: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Giant",
    "id": "giant",
	"color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/modifiers/giant.png",
    "description": "Jest gigantyczny i porusza się wolniej.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Giant Speed': {
            value: 1.0, 
            type: SettingTypes.Multiplier,
        },
    },
    "abilities": [CommonAbilities.None],
};
