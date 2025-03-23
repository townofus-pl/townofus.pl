import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Bait: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Bait",
    "id": "bait",
	"color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/modifiers/bait.png",
    "description": "Zmusza zabójcę do automatycznego zgłoszenia ciała.",
    "settings": {
        ...probabilityOfAppearing(0),
        'Minimum Delay for the Bait Report': {
            value: 0, 
            type: SettingTypes.Time,
        },
        'Maximum Delay for the Bait Report': {
            value: 1, 
            type: SettingTypes.Time,
        },
    },
    "abilities": [CommonAbilities.None],
};
