import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Scavenger: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Scavenger",
    "id": "scavenger",
	"color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/scavenger.png",
    "description": "Impostor, który poluje na ofiary. W trakcie gry losuje mu się cel, który powinien zabić. Z każdym zabójstwem celu, czas odnowienia zabójstwa Scavengera skraca się. W przypadku błędnego zabójstwa czas odnowienia zabójstwa Scavengera znacznie się wydłuża.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Scavenge Duration": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Scavenge Duration Increase Per Kill": {
            value: 10,
            type: SettingTypes.Time,
        },
        "Scavenge Kill Cooldown On Correct Kill": {
            value: 10,
            type: SettingTypes.Time,
        },
        "Kill Cooldown Multiplier On Incorrect Kill": {
            value: 3,
            type: SettingTypes.Multiplier,
        },

    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Vent, CommonAbilities.Sabotage],
};
