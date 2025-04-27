import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

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
    "type": RoleOrModifierTypes.Role,
    "name": "Plaguebearer / Pestilence",
    "id": "plaguebearer",
	"color": "#E6FFB3",
    "team": Teams.Neutral,
    "icon": "/images/roles/plaguebearer.png",
    "description": "Neutralna rola ze zdolnością, która pozwala mu zainfekować innych graczy. Po zainfekowaniu, zakażony gracz może zakażać innych przez interakcję z nimi. Gdy wszyscy gracze zostaną zainfekowani, Plaguebearer zamienia się w Pestilence. Pestilence to nieśmiertelna siła, która zyskuje zdolność zabijania i można ją zabić tylko przez głosowanie. Nawet śmierć Loversa nie zabije Pestilence. Plaguebearer lub Pestilence muszą być ostatnim zabójcą, aby wygrać grę.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Infect Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Pestilence Kill Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Pestilence Can Vent": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.Vent, PlagueBearerAbilities.Infect, PlagueBearerAbilities.Kill],
};
