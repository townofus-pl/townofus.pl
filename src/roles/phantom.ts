import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Phantom: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Phantom",
    "id": "phantom",
	"color": "#662966",
    "team": Teams.Neutral,
    "icon": "/images/roles/phantom.png",
    "description": "soon",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
