import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

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
    "type": RoleOrModifierTypes.Role,
    "name": "Morphling",
    "id": "morphling",
	"color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/morphling.png",
    "description": "Impostor, który może przebierać się za innych graczy. Poza spotkaniem może pobrać próbkę DNA od dowolnego gracza. Gdy to zrobi, zyskuje możliwość transformacji w wybranego wcześniej gracza. Nie może używać wentylacji.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Morphling Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Morphling Duration": {
            value: 10,
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
