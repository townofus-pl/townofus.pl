import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Immovable: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Immovable",
    "id": "immovable",
	"color": "#e6e6cc",
    "team": Teams.All,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Nie może zostać przeniesiony przez Transportera, Disperse, oraz spotkania.",
    "settings": {
        ...probabilityOfAppearing(0),
    },
    "abilities": [CommonAbilities.None],
};
