import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Celebrity: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Celebrity",
    "id": "celebrity",
	"color": "#ff9999",
    "team": Teams.Crewmate,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Gdy umrze, na najbliższym spotkaniu wszyscy gracze dowiedzą się kiedy, gdzie i jak zginął.",
    "settings": {
        ...probabilityOfAppearing(0),
    },
    "abilities": [CommonAbilities.None],
};
