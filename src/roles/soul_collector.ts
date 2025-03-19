import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const SoulCollectorAbilities = {
    Reap: {
        "name": "Reap (Oznacz)",
        "icon": "/images/abilities/reap.png"
    },
    Collect: {
        "name": "Collect (Zbierz)",
        "icon": "/images/abilities/collect.png"
    },
};

export const SoulCollector: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Soul Collector",
    "id": "soul_collector",
	"color": "#12e2bb",
    "team": Teams.Neutral,
    "icon": "/images/roles/soul_collector.png",
    "description": "Neutralna rola z własnym warunkiem zwycięstwa. Celem Soul Collectora jest zebranie określonej liczby dusz pobierając je od martwych ciał.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Reap Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Passively Collect A Soul Each Round": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Amount Of Souls Required To Win": {
            value: 5,
            type: SettingTypes.Number,
        },
    },
    "abilities": [SoulCollectorAbilities.Reap, SoulCollectorAbilities.Collect],
};
