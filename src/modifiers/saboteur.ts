import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Saboteur: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Saboteur",
    "id": "saboteur",
	"color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/modifiers/saboteur.png",
    "description": "Ma zmniejszony cooldown na sabotaże.",
    "settings": {
        ...probabilityOfAppearing(0),
        'Reduced Sabotage Bonus': {
            value: 10, type: SettingTypes.Time,
        },
    },
    "abilities": [CommonAbilities.None],
};
