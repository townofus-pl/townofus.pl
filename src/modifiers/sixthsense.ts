import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const SixthSense: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Sixth Sense",
    "id": "sixth_sense",
	"color": "#d9ff8c",
    "team": Teams.All,
    "icon": "/images/modifiers/sixth_sense.png",
    "description": "Ekran świeci mu się na żółto, gdy ktoś używa na nim swoich zdolności.",
    "settings": {
        ...probabilityOfAppearing(0),
    },
    "abilities": [CommonAbilities.None],
};
