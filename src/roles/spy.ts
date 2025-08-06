import { Role, RoleOrModifierTypes } from "@/constants/rolesAndModifiers";
import { Teams } from "@/constants/teams";
import { probabilityOfAppearing, SettingTypes } from "@/constants/settings";
import { CommonAbilities } from "@/constants/abilities";

export const Spy: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Spy",
    "id": "spy",
    "color": "#CCA3CC",
    "team": Teams.Crewmate,
    "icon": "/images/roles/spy.png",
    "description": "Crewmate, który zdobywa dodatkowe informacje podczas korzystania z Panelu Admina. Przy Panelu Admina Spy może zobaczyć kolory wszystkich graczy na mapie.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Who Sees Dead Bodies On Admin": {
            value: "Nobody",
            type: SettingTypes.Text,
            description: {
                0: "Nobody",
                1: "Spy",
                2: "Everyone But Spy",
                3: "Everyone"
            }
        },
    },
    "abilities": [CommonAbilities.None],
    "tip": "Panel Admina dla ciebie jest skarbnicą ważnych informacji. Zwróć uwagę na szybkie przemieszczanie, to prawdodobnie impostor w wentylacji."
};
