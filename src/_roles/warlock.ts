import {
    probabilityOfAppearing,
    RoleSettingTypes,
    Teams,
    type Role,
    CommonRoleAbilities,
} from "./shared";

export const Warlock: Role = {
    "name": "Warlock",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/warlock.png",
    "description": "Impostor, który może ładować manę. Gdy naładuje ją do 100%, może zabić wielu graczy bez cooldownu, pod warunkiem że zrobi to w jednej sekundzie. Warlock nie musi w pełni naładować many, aby móc zabijać, bez naładowanej many zabija jak zwykły impostor.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Time It Takes To Fully Charge": {
            value: 25.0,
            type: RoleSettingTypes.Time,
        },
        "Time It Takes To Use Full Charge": {
            value: 1.0,
            type: RoleSettingTypes.Time,
        },

    },
    "abilities": [CommonRoleAbilities.Kill, CommonRoleAbilities.Vent, CommonRoleAbilities.Sabotage],
};
