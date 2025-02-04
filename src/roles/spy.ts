import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Spy: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Spy",
    "color": "#CCA3CC",
    "team": Teams.Crewmate,
    "icon": "/images/roles/spy.png",
    "description": "Crewmate, który zdobywa dodatkowe informacje podczas korzystania z Panelu Admina. <br>Przy Panelu Admina Spy może zobaczyć kolory wszystkich graczy na mapie.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
    "tip": "Panel Admina dla ciebie jest skarbnicą ważnych informacji. Zwróć uwagę na szybkie przemieszczanie, to prawdodobnie impostor w wentylacji."
};
