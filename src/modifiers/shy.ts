import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Shy: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Shy",
    "color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Staje się przeźroczysty gdy się nie rusza.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Transparency Delay': {
            value: 0, type: SettingTypes.Time,
        },
        'Turn Transparent Duration': {
            value: 0, type: SettingTypes.Time,
        },
        'Final Opacity': {
            value: 10, type: SettingTypes.Percentage,
        },
    },
    "abilities": [CommonAbilities.None],
};
