import {CommonAbilities, probabilityOfAppearing, Role, SettingTypes, Teams} from "@/constants";

export const UndertakerAbilities = {
    Drag: {
        "name": "Drag (Przeciągnij)",
        "icon": "abilities/Drag.png"
    },

    Drop: {
        "name": "Drop (Upuść)",
        "icon": "abilities/Drop.png"
    }
};

export const Undertaker: Role = {
    "name": "Undertaker",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/undertaker.png",
    "description": "Impostor, który może przeciągać i upuszczać ciała.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Drag Cooldown": {
            value: 25.0,
            type: SettingTypes.Time,
        },
        "Undertaker Drag Speed": {  
            value: 1.0,
            type: SettingTypes.Multiplier,
        },
        "Undertaker Can Vent": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Undertaker Can Vent While Dragging": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Vent, CommonAbilities.Sabotage, UndertakerAbilities.Drag, UndertakerAbilities.Drop],
};
