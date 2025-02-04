import {CommonAbilities, probabilityOfAppearing, SettingTypes, Teams, type Role} from "@/constants";

export const Traitor: Role = {
    "name": "Traitor",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/traitor.png",
    "description": "Jeśli wszyscy Impostorzy zginą przed określonym momentem w grze, losowy Crewmate zostaje wybrany na Traitora. Traitor nie ma dodatkowych zdolności, a jego zadaniem jest pomścić martwych Impostorów. Po przemianie w Traitora, gracz dołącza do drużyny Impostorów.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Minimum People Alive When Traitor Can Spawn": {
            value: 5,
            type: SettingTypes.Number,
        },
        "Traitor Won't Spawn if Neutral Killing are Alive": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Vent, CommonAbilities.Sabotage],
};
