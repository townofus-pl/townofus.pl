import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const SixthSense: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Sixth Sense",
    "id": "sixth_sense",
	"color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Ekran świeci mu się na żółto, gdy ktoś używa na nim swoich zdolności.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
