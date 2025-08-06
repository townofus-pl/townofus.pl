import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Jester: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Jester",
    "id": "jester",
	"color": "#FFBFCF",
    "team": Teams.Neutral,
    "icon": "/images/roles/jester.png",
    "description": "Neutralna rola z własnym warunkiem zwycięstwa. Jester wygrywa tylko wtedy, gdy zostanie wygnany podczas głosowania. Przegrywa, jeśli zwyciężą Crewmate'owie, Impostorzy lub inna neutralna rola. Może chować się w wentylacji, ale nie może się nią poruszać.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Jester Can Button": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Jester Can Hide In Vents": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Jester Has Impostor Vision": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Jester Scatter Mechanic Enabled": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Jester Scatter Timer": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Jester Win": { 
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: "Ends Game",
                1: "Ghosts Win", 
                2: "Nobody Wins"
            }
        },
    },
    "abilities": [CommonAbilities.Vent],
}
