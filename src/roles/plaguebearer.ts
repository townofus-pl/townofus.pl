import {probabilityOfAppearing, SettingTypes, Teams, type Role} from "@/constants";

export const PlagueBearerAbilities = {
    Infect: {
        "name": "Infect (Zainfekuj) *Plaguebearer*",
        "icon": "/images/abilities/infect.png"
    },
    Kill: {
        "name": "Kill (Zabij) *Pestilence*",
        "icon": "/images/abilities/kill.png"
    },
};

export const Plaguebearer: Role = {
    "name": "Plaguebearer",
    "color": "#E6FFB3",
    "team": Teams.Neutral,
    "icon": "/images/roles/plaguebearer.png",
    "description": "Neutralna rola ze zdolnością, która pozwala mu zainfekować innych graczy. Po zainfekowaniu, zakażony gracz może zakażać innych przez interakcję z nimi. Gdy wszyscy gracze zostaną zainfekowani, Plaguebearer zamienia się w Pestilence. Pestilence to nieśmiertelna siła, która zyskuje zdolność zabijania i można ją zabić tylko przez głosowanie. Nawet śmierć kochanka nie zabije Pestilence. Plaguebearer lub Pestilence muszą być ostatnim zabójcą, aby wygrać grę.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Infect Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Pestilence Kill Cooldown": {
            value: 27.5,
            type: SettingTypes.Time,
        },
        "Pestilence Can Vent": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [PlagueBearerAbilities.Infect, PlagueBearerAbilities.Kill],
};
