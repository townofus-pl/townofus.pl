import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Haunter: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Haunter",
    "color": "#D4D4D4",
    "team": Teams.Crewmate,
    "icon": "/images/roles/haunter.png",
    "description": "soon",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
