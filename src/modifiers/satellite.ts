import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const SatelliteAbilities = {
    Broadcast: {
        "name": "Broadcast (Wykrywanie)",
        "icon": "/images/abilities/broadcast.png",
    },
};

export const Satellite: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Satellite",
    "id": "satellite",
	"color": "#0099cc",
    "team": Teams.All,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Posiada jednorazową umiejętność, która wykrywa wszystkie martwe ciała.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Broadcast Duration": {
            value: 10,
            type: SettingTypes.Time,
        },
    },    
    "abilities": [SatelliteAbilities.Broadcast],
};
