import {CommonRoleAbilities, Distances, probabilityOfAppearing, type Role, RoleSettingTypes, Teams,} from "./shared";

export const GlitchAbilities = {
    Hacker: {
        "name": "Hacker (Zhakuj)",
        "icon": "/images/abilities/hack.png"
    },
    Mimic: {
        "name": "Mimic (Naśladuj)",
        "icon": "/images/abilities/mimic.png"
    }
};

export const Glitch: Role = {
    "name": "Glitch",
    "color": "#00FF00",
    "team": Teams.Neutral,
    "icon": "/images/roles/glitch.png",
    "description": "Neutralna rola z własnym warunkiem zwycięstwa. Celem Glitcha jest wyeliminowanie wszystkich graczy. Glitch może hakować graczy, co uniemożliwia zhakowanemu graczowi jakąkolwiek akcję poza chodzeniem po mapie. Glitch może także \"naśladować\" inną osobę, przez co będzie wyglądać dokładnie jak ta osoba.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Mimic Cooldown": {
            value: 25.0,
            type: RoleSettingTypes.Time,
        },
        "Mimic Duration": {
            value: 10.0,
            type: RoleSettingTypes.Time,
        },
        "Hack Cooldown": {
            value: 25.0,
            type: RoleSettingTypes.Time,
        },
        "Hack Duration": {
            value: 15.0,
            type: RoleSettingTypes.Time,
        },
        "Glitch Kill Cooldown": {
            value: 27.5,
            type: RoleSettingTypes.Time,
        },
        "Glitch Hack Distance": {
            value: Distances.Short,
            type: RoleSettingTypes.Text,
        },
        "Glitch Can Vent": {
            value: true,
            type: RoleSettingTypes.Boolean,
        },
    },
    "abilities": [CommonRoleAbilities.Kill, CommonRoleAbilities.Vent, GlitchAbilities.Hacker, GlitchAbilities.Mimic],
};
