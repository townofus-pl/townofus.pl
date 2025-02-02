// {
//     "name": "Juggernaut",
//     "color": "#8C004D",
//     "team": "neutral",
//     "icon": "icons/juggernaut.png",
//     "description": "Neutralna rola z własnym warunkiem zwycięstwa. Specjalną zdolnością Juggernauta jest to, że czas odnowienia zabójstwa skraca się z każdym zabójstwem. Oznacza to, że Juggernaut teoretycznie może mieć czas odnowienia zabójstwa równy 0 sekund! Juggernaut musi być ostatnim zabójcą, aby wygrać grę.",
//     "settings": [
//         "Probability Of Appearing: x%",
//         "Juggernaut Initial Kill Cooldown: 35,0s",
//         "Reduced Kill Cooldown Per Kill: 5,0s",
//         "Juggernaut Can Vent: ✓"
//     ],
//     "abilities": [
//         {
//             "name": "Kill (Zabij)",
//             "icon": "abilities/Kill.png"
//         },
//         {
//             "name": "Vent (Wejdź do wentylacji)",
//             "icon": "abilities/Vent.png"
//         }
//     ],
//     "tip": ""
// }

import {probabilityOfAppearing, Role, RoleSettingTypes, Teams, CommonRoleAbilities} from "./shared";

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
            type: RoleSettingTypes.Time,
        },
        "Reduced Kill Cooldown Per Kill": {
            value: 5,
            type: RoleSettingTypes.Time,
        },
        "Juggernaut Can Vent": {
            value: 1,
            type: RoleSettingTypes.Boolean,
        }
    },
    "abilities": [
        CommonRoleAbilities.Kill,
        CommonRoleAbilities.Vent
    ]
}
