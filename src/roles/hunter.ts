import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Hunter: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Hunter",
    "color": "#29AA88",
    "team": Teams.Crewmate,
    "icon": "/images/roles/hunter.png",
    "description": "soon",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
