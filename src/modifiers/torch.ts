import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Torch: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Torch",
    "id": "torch",
	"color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/modifiers/torch.png",
    "description": "Podczas sabotażu świateł nie zmniejsza mu się pole widzenia.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
