import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Mini: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Mini",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/modifiers/mini.png",
    "description": "Jest mały.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
