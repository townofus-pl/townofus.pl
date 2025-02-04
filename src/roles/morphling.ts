import {CommonAbilities, probabilityOfAppearing, SettingTypes, Teams, type Role} from "@/constants";

export const MorphlingAbilities = {
    Sample: {
        "name": "Sample (Pobierz próbkę DNA)",
        "icon": "/images/abilities/sample.png"
    },
    Morph: {
        "name": "Morph (Przebierz się)",
        "icon": "/images/abilities/morph.png"
    },
};

export const Morphling: Role = {
    "name": "Morphling",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/morphling.png",
    "description": "Impostor, który może przebierać się za innych graczy. Poza spotkaniem może pobrać próbkę DNA od dowolnego gracza. Gdy to zrobi, zyskuje możliwość transformacji w wybranego wcześniej gracza. Nie może używać wentylacji.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Morphling Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Morphling Duration": {
            value: 15,
            type: SettingTypes.Time,
        },
        "Morphling Can Vent": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.Kill, MorphlingAbilities.Sample, MorphlingAbilities.Morph],
    "tip": "gdy jesteś w przebraniu, nie pokazuj się w otoczeniu oryginału."
};
