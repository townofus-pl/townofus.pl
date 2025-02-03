import {CommonAbilities, probabilityOfAppearing, type Role, SettingTypes, Teams,} from "@/constants";

export const GrenadierAbilities = {
    Flash: {
        "name": "Flash (Oślep)",
        "icon": "/images/abilities/flash.png"
    }
};

export const Grenadier: Role = {
    "name": "Grenadier",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/grenadier.png",
    "description": "Impostor, który może rzucać granatami dymnymi. Podczas gry Grenadier ma możliwość rzucenia granatu dymnego, który oślepia Crewmate’ów, uniemożliwiając im widzenie. Granat dymny nie może być aktywowany w czasie sabotażu.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Flash Grenade Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Flash Grenade Duration": {
            value: 7,
            type: SettingTypes.Time,
        },
        "Flash Radius": {
            value: 1,
            type: SettingTypes.Radius,
        },
        "Indicate Flashed Crewmates": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Grenadier Can Vent": {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Vent, CommonAbilities.Sabotage, GrenadierAbilities.Flash],
};
