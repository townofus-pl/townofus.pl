import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const DetectiveAbilities = {
    Examine: {
        "name": "Examine (Zbadaj)",
        "icon": "/images/abilities/examine.png"
    },
    Inspect: {
        "name": "Inspect (Sprawdź)",
        "icon": "/images/abilities/inspect.png"
    }
};

export const Detective: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Detective",
    "id": "detective",
	"color": "#4D4DFF",
    "team": Teams.Crewmate,
    "icon": "/images/roles/detective.png",
    "description": "Crewmate, który może badać miejsca zbrodni i następnie sprawdzać graczy. Najpierw musi znaleźć miejsce zbrodni i je zbadać. W tej samej lub kolejnych rundach może następnie sprawdzić graczy, aby ustalić, czy byli zabójcami. Jeśli sprawdzany gracz jest zabójcą lub znajdował się w pobliżu miejsca zbrodni, otrzyma czerwony błysk. W przeciwnym razie błysk będzie zielony.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Examine Cooldown": {
            value: 25.0,
            type: SettingTypes.Time,
        },    
        "Show Detective Reports": {
            value: true,
            type: SettingTypes.Boolean,
        },    
        "Time Where Detective Will Have Role": {
            value: 15.0,
            type: SettingTypes.Time,
        },    
        "Time Where Detective Will Have Faction": {
            value: 30.0,
            type: SettingTypes.Time,
        },    
    },
    "abilities": [DetectiveAbilities.Examine, DetectiveAbilities.Inspect],
};
