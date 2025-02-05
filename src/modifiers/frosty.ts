import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Frosty: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Frosty",
    "color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/modifiers/frosty.png",
    "description": "Gdy umrze, jego zabójca zostanie spowalniony.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Chill Duration': {
            value: 10, type: SettingTypes.Time,
        },
        'Chill Start Speed': {
            value: 0.75, type: SettingTypes.Multiplier,
        },
    },
    "abilities": [CommonAbilities.None],
};
