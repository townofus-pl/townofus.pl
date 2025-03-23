import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Juggernaut: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Juggernaut",
    "id": "juggernaut",
	"color": "#8C004D",
    "team": Teams.Neutral,
    "icon": "/images/roles/juggernaut.png",
    "description": "Neutralna rola z własnym warunkiem zwycięstwa. Specjalną zdolnością Juggernauta jest to, że czas odnowienia zabójstwa skraca się z każdym zabójstwem. Oznacza to, że Juggernaut teoretycznie może mieć czas odnowienia zabójstwa równy 0 sekund! Juggernaut musi być ostatnim zabójcą, aby wygrać grę.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Juggernaut Initial Kill Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Reduced Kill Cooldown Per Kill": {
            value: 5,
            type: SettingTypes.Time,
        },
        "Juggernaut Can Vent": {
            value: false,
            type: SettingTypes.Boolean,
        }
    },
    "abilities": [
        CommonAbilities.Kill,
        CommonAbilities.Vent
    ]
}
