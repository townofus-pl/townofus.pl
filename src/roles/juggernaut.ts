import {CommonAbilities, probabilityOfAppearing, Role, SettingTypes, Teams} from "@/constants";

export const Juggernaut: Role = {
    "name": "Juggernaut",
    "color": "#8C004D",
    "team": Teams.Neutral,
    "icon": "/images/roles/juggernaut.png",
    "description": "Neutralna rola z własnym warunkiem zwycięstwa. Specjalną zdolnością Juggernauta jest to, że czas odnowienia zabójstwa skraca się z każdym zabójstwem. Oznacza to, że Juggernaut teoretycznie może mieć czas odnowienia zabójstwa równy 0 sekund! Juggernaut musi być ostatnim zabójcą, aby wygrać grę.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Juggernaut Initial Kill Cooldown": {
            value: 35,
            type: SettingTypes.Time,
        },
        "Reduced Kill Cooldown Per Kill": {
            value: 5,
            type: SettingTypes.Time,
        },
        "Juggernaut Can Vent": {
            value: true,
            type: SettingTypes.Boolean,
        }
    },
    "abilities": [
        CommonAbilities.Kill,
        CommonAbilities.Vent
    ]
}
