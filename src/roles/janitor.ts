import {CommonAbilities, probabilityOfAppearing, Role, Teams} from "@/constants";

const JanitorAbilities = {
    Clean: {
        "name": "Clean (Sprzątnij ciało)",
        "icon": "/images/abilities/janitor.png"
    }
}

export const Janitor: Role = {
    "name": "Janitor",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/janitor.png",
    "description": "Impostor, który może sprzątać ciała. Zarówno jego zdolność zabójstwa, jak i czyszczenia mają wspólny czas odnowienia, co oznacza, że musi wybrać, którą z nich chce użyć.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [
        CommonAbilities.Kill,
        CommonAbilities.Vent,
        CommonAbilities.Sabotage,
        JanitorAbilities.Clean
    ],
    "tip": ""
}
