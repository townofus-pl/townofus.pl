import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Lovers: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Lovers",
    "color": "#FF69B4",
    "team": Teams.All,
    "icon": "/images/modifiers/lovers.png",
    "description": "Para graczy połączona ze sobą, wygrywająca razem.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Both Lovers Die': {
            value: true, type: SettingTypes.Boolean,
        },
        'Loving Impostor Probability': {
            value: 20, type: SettingTypes.Percentage,
        },
        'Neutral Modifiers Can Be Lovers': {
            value: true, type: SettingTypes.Boolean,
        },
        'Impostor Lover Can Kill Teammate': {
            value: false, type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.None],
};
