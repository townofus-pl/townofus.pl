import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {Distances, probabilityOfAppearing, Setting, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

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

export const GlitchSettings: Record<string, Setting> = {
    ...probabilityOfAppearing(-1),
    "Mimic Cooldown": {
        value: 25.0,
        type: SettingTypes.Time,
    },
    "Mimic Duration": {
        value: 10.0,
        type: SettingTypes.Time,
    },
    "Hack Cooldown": {
        value: 25.0,
        type: SettingTypes.Time,
    },
    "Hack Duration": {
        value: 15.0,
        type: SettingTypes.Time,
    },
    "Glitch Kill Cooldown": {
        value: 27.5,
        type: SettingTypes.Time,
    },
    "Glitch Hack Distance": {
        value: Distances.Short,
        type: SettingTypes.Text,
    },
    "Glitch Can Vent": {
        value: true,
        type: SettingTypes.Boolean,
    },
}

export const Glitch: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Glitch",
    "id": "glitch",
	"color": "#00FF00",
    "team": Teams.Neutral,
    "icon": "/images/roles/glitch.png",
    "description": "Neutralna rola z własnym warunkiem zwycięstwa. Celem Glitcha jest wyeliminowanie wszystkich graczy. Glitch może hakować graczy, co uniemożliwia zhakowanemu graczowi jakąkolwiek akcję poza chodzeniem po mapie. Glitch może także \"naśladować\" inną osobę, przez co będzie wyglądać dokładnie jak ta osoba.",
    "settings": GlitchSettings,
    "abilities": [CommonAbilities.Kill, CommonAbilities.Vent, GlitchAbilities.Hacker, GlitchAbilities.Mimic],
};
