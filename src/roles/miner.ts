import {CommonAbilities, probabilityOfAppearing, SettingTypes, Teams, type Role} from "@/constants";

export const MinerAbilities = {
    Mine: {
        "name": "Mine (Wykop)",
        "icon": "/images/abilities/mine.png"
    },
};

export const Miner: Role = {
    "name": "Miner",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/miner.png",
    "description": "Impostor, który może tworzyć nowe wentylacje. Te wentylacje łączą się tylko ze sobą, tworząc nową ścieżkę.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Mine Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Vent, CommonAbilities.Sabotage, MinerAbilities.Mine],
};
