import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Sleuth: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Sleuth",
    "id": "sleuth",
	"color": "#803333",
    "team": Teams.All,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Zna rolę zgłoszonego przez siebie ciała.",
    "settings": {
        ...probabilityOfAppearing(0),
    },
    "abilities": [CommonAbilities.None],
};
