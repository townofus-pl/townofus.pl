import {probabilityOfAppearing, Role, SettingTypes, Teams} from "@/constants";

export const JesterAbilities = {
    Vent: {
        "name": "Vent (Wejdź do wentylacji)",
        "icon": "/images/abilities/Vent.png"
    }
}

export const Jester: Role = {
    "name": "Jester",
    "color": "#FFBFCF",
    "team": Teams.Neutral,
    "icon": "/images/roles/jester.png",
    "description": "Neutralna rola z własnym warunkiem zwycięstwa. Jester wygrywa tylko wtedy, gdy zostanie wygnany podczas głosowania. Przegrywa, jeśli zwyciężą Crewmates, Impostorzy lub inna neutralna rola. Może chować się w wentylacji, ale nie może się nią poruszać.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Jester Can Button": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Jester Can Hide In Vents": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Jester Has Impostor Vision": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Jester Haunts Player On Victory": {
            value: true,
            type: SettingTypes.Boolean,
        }
    },
    "abilities": [JesterAbilities.Vent],
}
