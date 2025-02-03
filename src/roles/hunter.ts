import {CommonRoleAbilities, probabilityOfAppearing, type Role, Teams,} from "./shared";

export const Hunter: Role = {
    "name": "Hunter",
    "color": "#29AA88",
    "team": Teams.Crewmate,
    "icon": "/images/roles/hunter.png",
    "description": "soon",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonRoleAbilities.None],
};
