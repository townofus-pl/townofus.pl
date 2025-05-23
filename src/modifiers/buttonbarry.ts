import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";

export const ButtonBarryAbilities = {
    ButtonBarry: {
        "name": "Button (Naciśnij przycisk)",
        "icon": "/images/abilities/button.png",
    },
};

export const ButtonBarry: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Button Barry",
    "id": "button_barry",
	"color": "#e600ff",
    "team": Teams.All,
    "icon": "/images/modifiers/buttonbarry.png",
    "description": "Może zwołać spotkanie z dowolnego miejsca na mapie.",
    "settings": {
        ...probabilityOfAppearing(0),
    },
    "abilities": [ButtonBarryAbilities.ButtonBarry],
};
