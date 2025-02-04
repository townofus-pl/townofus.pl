import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const DisperserAbilities = {
    Disperser: {
        "name": "Disperser",
        "icon": "/images/abilities/placeholder.png",
    },
};

export const Disperser: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Disperser",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Może jednorazowo wysłać wszystkich do losowych ventów.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Uses': {
            value: 1, type: SettingTypes.Number,
        },
    },
    "abilities": [DisperserAbilities.Disperser],
};
