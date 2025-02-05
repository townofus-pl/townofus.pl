import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const EscapistAbilities = {
    Mark: {
        "name": "Mark (Oznacz)",
        "icon": "/images/abilities/mark.png"
    },
    Recall: {
        "name": "Recall (Powrót)",
        "icon": "/images/abilities/recall.png"
    },
};

export const Escapist: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Escapist",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/escapist.png",
    "description": "Impostor, który może teleportować się do wybranej wcześniej lokalizacji. Raz na rundę Escapist może oznaczyć miejsce, do którego później będzie mógł się teleportować.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Recall Cooldown": {
            value: 25.0,
            type: SettingTypes.Time,
        },
        "Escapist Can Vent": {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Sabotage, EscapistAbilities.Mark, EscapistAbilities.Recall],
};
