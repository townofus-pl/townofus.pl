import {
    probabilityOfAppearing,
    Teams,
    type Role,
    CommonRoleAbilities,
} from "./shared";

export const Haunter: Role = {
    "name": "Haunter",
    "color": "#D4D4D4",
    "team": Teams.Crewmate,
    "icon": "/images/roles/haunter.png",
    "description": "soon",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonRoleAbilities.None],
};
