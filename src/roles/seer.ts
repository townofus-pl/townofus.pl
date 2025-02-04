import {probabilityOfAppearing, SettingTypes, Teams, type Role} from "@/constants";

export const SeerAbilities = {
    Reveal: {
        "name": "Reveal (Odkryj)",
        "icon": "/images/abilities/reveal.png"
    },
};

export const Seer: Role = {
    "name": "Seer",
    "color": "#FFCC80",
    "team": Teams.Crewmate,
    "icon": "/images/roles/seer.png",
    "description": "Crewmate, który może sprawdzić przynależność drużynową innego gracza. Po użyciu zdolności, nick sprawdzanego gracza zmienia kolor:<br>Na <span style='color: #00ff00;'>Zielony</span> – jeśli gracz należy do drużyny Crewmate'ów.<br>Na <span style='color: #ff0000;'>Czerwony</span> – jeśli gracz ma inną rolę (Impostor lub neutralną).",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Seer Cooldown": {
            value: 35,
            type: SettingTypes.Time,
        },
        "Crewmate Killing Roles Are Red": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Neutral Benign Roles Are Red": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Neutral Evil Roles Are Red": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Neutral Killing Roles Are Red": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Traitor Does Not Swap Colours": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [SeerAbilities.Reveal],
};
