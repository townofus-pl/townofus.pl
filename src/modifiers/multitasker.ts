import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Multitasker: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Multitasker",
    "id": "multitasker",
	"color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Posiada półprzezroczyste zadania, dzięki czemu widzi co się wokół niego dzieje.",
    "settings": {
        ...probabilityOfAppearing(0),
    },
    "abilities": [CommonAbilities.None],
};
