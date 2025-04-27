import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Mini: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Mini",
    "id": "mini",
	"color": "#ccffe6",
    "team": Teams.All,
    "icon": "/images/modifiers/mini.png",
    "description": "Jest mały.",
    "settings": {
        ...probabilityOfAppearing(0),
    },
    "abilities": [CommonAbilities.None],
};
