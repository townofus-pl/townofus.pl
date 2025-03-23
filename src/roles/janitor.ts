import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

const JanitorAbilities = {
    Clean: {
        "name": "Clean (Sprzątnij ciało)",
        "icon": "/images/abilities/janitor.png"
    }
}

export const Janitor: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Janitor",
    "id": "janitor",
	"color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/janitor.png",
    "description": "Impostor, który może sprzątać ciała. Zarówno jego zdolność zabójstwa, jak i czyszczenia mają wspólny czas odnowienia, co oznacza, że musi wybrać, którą z nich chce użyć.",
    "settings": {
        ...probabilityOfAppearing(0),
    },
    "abilities": [
        CommonAbilities.Kill,
        CommonAbilities.Vent,
        CommonAbilities.Sabotage,
        JanitorAbilities.Clean
    ],
    "tip": ""
}
