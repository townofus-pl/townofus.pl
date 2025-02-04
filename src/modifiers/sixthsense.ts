import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const SixthSense: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Sixth Sense",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Widzi kto używa na nim interakcji.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
