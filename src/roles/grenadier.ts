import {CommonRoleAbilities, probabilityOfAppearing, type Role, RoleSettingTypes, Teams,} from "./shared";

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
            type: RoleSettingTypes.Time,
        },
        "Flash Grenade Duration": {
            value: 7,
            type: RoleSettingTypes.Time,
        },
        "Flash Radius": {
            value: 1,
            type: RoleSettingTypes.Radius,
        },
        "Indicate Flashed Crewmates": {
            value: true,
            type: RoleSettingTypes.Boolean,
        },
        "Grenadier Can Vent": {
            value: true,
            type: RoleSettingTypes.Boolean,
        },
    },
    "abilities": [CommonRoleAbilities.Kill, CommonRoleAbilities.Vent, CommonRoleAbilities.Sabotage, GrenadierAbilities.Flash],
};
