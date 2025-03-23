import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Flash: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Flash",
    "id": "flash",
	"color": "#FFFFFF",
    "team": Teams.All,
    "icon": "/images/modifiers/flash.png",
    "description": "Porusza się z większą prędkością.",
    "settings": {
        ...probabilityOfAppearing(0),
        'Flash Speed': {
            value: 1.25, type: SettingTypes.Multiplier,
        },
    },
    "abilities": [CommonAbilities.None],
};
