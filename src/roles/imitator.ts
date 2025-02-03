import {probabilityOfAppearing, type Role, Teams} from "@/constants";

export const ImitatorAbilities = {
    Imitate: {
        "name": "Imitate (Naśladuj)",
        "icon": "/images/abilities/imitateselect.png"
    }
};

export const Imitator: Role = {
    "name": "Imitator",
    "color": "#B3D94D",
    "team": Teams.Crewmate,
    "icon": "/images/roles/imitator.png",
    "description": "Crewmate, który może naśladować martwych Crewmate’ów. Podczas spotkań Imitator może wybrać, kogo z martwych graczy będzie naśladować w następnej rundzie. Może używać zdolności każdego martwego gracza tyle razy, ile chce.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [ImitatorAbilities.Imitate],
};
