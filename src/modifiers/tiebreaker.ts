import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Tiebreaker: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Tiebreaker",
    "id": "tiebreaker",
	"color": "#99e699",
    "team": Teams.All,
    "icon": "/images/modifiers/tiebreaker.png",
    "description": "Jego głos rozstrzyga remisy podczas głosowania.",
    "settings": {
        ...probabilityOfAppearing(0),
    },
    "abilities": [CommonAbilities.None],
};
