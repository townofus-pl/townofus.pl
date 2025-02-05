import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Radar: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Radar",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Posiada strzałkę wskazującą najbliższego gracza.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
