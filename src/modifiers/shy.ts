import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Shy: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Shy",
    "id": "shy",
	"color": "#ffb3cc",
    "team": Teams.All,
    "icon": "/images/modifiers/shy.png",
    "description": "Staje się przezroczysty gdy się nie rusza.",
    "settings": {
        ...probabilityOfAppearing(0),
        'Transparency Delay': {
            value: 5, type: SettingTypes.Time,
        },
        'Turn Transparent Duration': {
            value: 5, type: SettingTypes.Time,
        },
        'Final Opacity': {
            value: 20, type: SettingTypes.Percentage,
        },
    },
    "abilities": [CommonAbilities.None],
};
