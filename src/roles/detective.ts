import {probabilityOfAppearing, type Role, Teams} from "./shared";

export const DetectiveAbilities = {
    Examine: {
        "name": "Examine (Zbadaj)",
        "icon": "/images/abilities/examine.png"
    }
};

export const Detective: Role = {
    "name": "Detective",
    "color": "#4D4DFF",
    "team": Teams.Crewmate,
    "icon": "/images/roles/detective.png",
    "description": "Crewmate, który może badać miejsca zbrodni i następnie sprawdzać graczy. Najpierw musi znaleźć miejsce zbrodni i je zbadać. W tej samej lub kolejnych rundach może następnie sprawdzić graczy, aby ustalić, czy byli zabójcami. Jeśli sprawdzany gracz jest zabójcą lub znajdował się w pobliżu miejsca zbrodni, otrzyma czerwony błysk. W przeciwnym razie błysk będzie zielony.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [DetectiveAbilities.Examine],
};
