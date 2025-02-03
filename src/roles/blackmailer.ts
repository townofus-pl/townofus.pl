import {CommonRoleAbilities, probabilityOfAppearing, type Role, RoleSettingTypes, Teams,} from "./shared";

export const BlackmailerAbilities = {
    Blackmail: {
        "name": "Blackmail (Szantażuj)",
        "icon": "/images/abilities/blackmail.png"
    },
};

export const Blackmailer: Role = {
    "name": "Blackmailer",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/blackmailer.png",
    "description": "Impostor, który może wyciszyć graczy podczas spotkań. W każdej rundzie Blackmailer może podejść do kogoś i go szantażować. Szantaż uniemożliwia zaszantażowanej osobie mówienie oraz głosowanie podczas następnego spotkania.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Initial Blackmail Cooldown": {
            value: 10.0,
            type: RoleSettingTypes.Time,
        },
        "Only Target Sees Blackmail": {
            value: false,
            type: RoleSettingTypes.Boolean,
        },
        "Maximum People Alive Where Blackmailed Can Vote": {
            value: 5,
            type: RoleSettingTypes.Number,
        },
    },
    "abilities": [CommonRoleAbilities.Kill, CommonRoleAbilities.Vent, CommonRoleAbilities.Sabotage, BlackmailerAbilities.Blackmail],
};
