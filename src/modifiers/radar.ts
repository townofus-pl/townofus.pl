import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Radar: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Radar",
    "id": "radar",
	"color": "#ff0080",
    "team": Teams.All,
    "icon": "/images/modifiers/radar.png",
    "description": "Posiada strzałkę wskazującą najbliższego gracza.",
    "settings": {
        ...probabilityOfAppearing(0),
    },
    "abilities": [CommonAbilities.None],
};
