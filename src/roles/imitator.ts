import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";

export const ImitatorAbilities = {
    Imitate: {
        "name": "Imitate (Naśladuj)",
        "icon": "/images/abilities/imitateselect.png"
    }
};

export const Imitator: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Imitator",
    "color": "#B3D94D",
    "team": Teams.Crewmate,
    "icon": "/images/roles/imitator.png",
    "description": "Crewmate, który może naśladować martwych Crewmate’ów. Podczas spotkań Imitator może przejąć rolę jednego z martwych graczy, zyskując jego umiejętności na następną rundę. Może używać zdolności każdego martwego gracza tyle razy, ile chce. Imitator może naśladować tylko role Crewmate’ów, których umiejętności działają poza spotkaniem.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [ImitatorAbilities.Imitate],
};
