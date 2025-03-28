import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const DisperserAbilities = {
    Disperser: {
        "name": "Disperser",
        "icon": "/images/abilities/disperse.png",
    },
};

export const Disperser: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Disperser",
    "id": "disperser",
	"color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/modifiers/disperse.png",
    "description": "Może jednorazowo wysłać wszystkich graczy do losowych ventów.",
    "settings": {
        ...probabilityOfAppearing(0),
        'Uses': {
            value: 1, type: SettingTypes.Number,
        },
    },
    "abilities": [DisperserAbilities.Disperser],
};
