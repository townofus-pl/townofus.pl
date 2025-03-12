import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const DoubleShot: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Double Shot",
    "id": "double_shot",
	"color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/modifiers/doubleshot.png",
    "description": "Gdy pierwsza próba zgadnięcia roli nie powiedzie się, Impostor z Double shotem dostaje następną szansę.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
