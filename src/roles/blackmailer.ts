import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const BlackmailerAbilities = {
    Blackmail: {
        "name": "Blackmail (Szantażuj)",
        "icon": "/images/abilities/blackmail.png"
    },
};

export const Blackmailer: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Blackmailer",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/blackmailer.png",
    "description": "Impostor, który może wyciszyć graczy podczas spotkań. W każdej rundzie Blackmailer może podejść do kogoś i go szantażować. Szantaż uniemożliwia zaszantażowanej osobie mówienie oraz głosowanie podczas następnego spotkania.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Initial Blackmail Cooldown": {
            value: 10.0,
            type: SettingTypes.Time,
        },
        "Only Target Sees Blackmail": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Maximum People Alive Where Blackmailed Can Vote": {
            value: 5,
            type: SettingTypes.Number,
        },
    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Vent, CommonAbilities.Sabotage, BlackmailerAbilities.Blackmail],
};
