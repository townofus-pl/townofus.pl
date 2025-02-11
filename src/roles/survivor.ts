import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const SurvivorAbilities = {
    Safeguard: {
        "name": "Safeguard (Ochroń się)",
        "icon": "/images/abilities/vest.png"
    },
};

export const Survivor: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Survivor",
    "id": "survivor",
	"color": "#FFEB4D",
    "team": Teams.Neutral,
    "icon": "/images/roles/survivor.png",
    "description": "Survivor to neutralna rola, która wygrywa, po prostu przeżywając do końca rozgrywki. Jednak jeśli grę wygrają Lovers lub neutralna zła rola, Survivor przegrywa. Posiada umiejętność dająca czasową ochronę przed zabójstwem.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Vest Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Vest Duration": {
            value: 10,
            type: SettingTypes.Time,
        },
        "Kill Cooldown Reset On Attack": {
            value: 2.5,
            type: SettingTypes.Time,
        },
        "Maximum Number Of Vests": {
            value: 5,
            type: SettingTypes.Number,
        },
    },
    "abilities": [SurvivorAbilities.Safeguard],
};
