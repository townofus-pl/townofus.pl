import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const SoulCollectorAbilities = {
    Reap: {
        "name": "Reap (Zbierz)",
        "icon": "/images/abilities/reap.png"
    },
};

export const SoulCollector: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Soul Collector",
    "id": "soul_collector",
	"color": "#12e2bb",
    "team": Teams.Neutral,
    "icon": "/images/roles/soul_collector.png",
    "description": "Neutralna rola z własnym warunkiem zwycięstwa. Soul Collector zbiera graczy, zabijając ich. Zbieranie nie zostawia ciała, zamiast tego pozostaje dusza. Musi zostać ostatnim żywym zabójcą, aby wygrać grę.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Reap Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Soul Collector Can Vent": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.Vent, SoulCollectorAbilities.Reap],
};
