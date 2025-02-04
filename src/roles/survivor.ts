import {probabilityOfAppearing, SettingTypes, Teams, type Role} from "@/constants";

export const SurvivorAbilities = {
    Safeguard: {
        "name": "Safeguard (Ochroń się)",
        "icon": "/images/abilities/vest.png"
    },
};

export const Survivor: Role = {
    "name": "survivor",
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
