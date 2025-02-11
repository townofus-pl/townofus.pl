import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";

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
        ...probabilityOfAppearing(-1),
    },
    "abilities": [DetectiveAbilities.Examine, DetectiveAbilities.Inspect],
};
