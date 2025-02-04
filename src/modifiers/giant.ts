import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Giant: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Giant",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/modifiers/giant.png",
    "description": "Jest gigantyczny i porusza się wolniej.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Giant Speed': {
            value: 0.75, type: SettingTypes.Multiplier,
        },
    },
    "abilities": [CommonAbilities.None],
};
