import {
    probabilityOfAppearing,
    RoleSettingTypes,
    Teams,
    type Role,
    CommonRoleAbilities,
} from "./shared";

export const VeteranAbilities = {
    Alert: {
        "name": "Alert (Czujność)",
        "icon": "/images/abilities/alert.png"
    },
};

export const Veteran: Role = {
    "name": "Veteran",
    "color": "#998033",
    "team": Teams.Crewmate,
    "icon": "/images/roles/veteran.png",
    "description": "Crewmate, który może przejść w tryb czujności. Gdy Veteran jest w trybie czujności, każda osoba, niezależnie od tego, czy jest Crewmate'em, Neutralem, czy Impostorem, jeśli wejdzie w interakcję z Veteranem, umrze.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Can Be Killed On Alert": {
            value: 0,
            type: RoleSettingTypes.Boolean,
        },
        "Alert Cooldown": {
            value: 25.0,
            type: RoleSettingTypes.Time,
        },
        "Alert Duration": {
            value: 10.0,
            type: RoleSettingTypes.Time,
        },
        "Maximum Number Of Alerts": {
            value: 5,
            type: RoleSettingTypes.Number,
        },
    },
    "abilities": [VeteranAbilities.Alert],
};
