import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Taskmaster: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Taskmaster",
    "id": "taskmaster",
	"color": "#669966",
    "team": Teams.Crewmate,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Po każdym spotkaniu automatycznie kończy losowe zadanie.",
    "settings": {
        ...probabilityOfAppearing(0),
    },
    "abilities": [CommonAbilities.None],
};
