import {
    probabilityOfAppearing,
    RoleSettingTypes,
    Teams,
    type Role,
    CommonRoleAbilities,
} from "./shared";

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
    "name": "Escapist",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/escapist.png",
    "description": "Impostor, który może teleportować się do wybranej wcześniej lokalizacji. Raz na rundę Escapist może oznaczyć miejsce, do którego później będzie mógł się teleportować .",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Recall Cooldown": {
            value: 25.0,
            type: RoleSettingTypes.Time,
        },
        "Escapist Can Vent": {
            value: 0,
            type: RoleSettingTypes.Boolean,
        },
    },
    "abilities": [CommonRoleAbilities.Kill, CommonRoleAbilities.Sabotage, EscapistAbilities.Mark, EscapistAbilities.Recall],
};
