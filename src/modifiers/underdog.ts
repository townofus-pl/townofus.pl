import {
    probabilityOfAppearing,
    type Role,
    SettingTypes,
    Teams,
} from "@/constants";

export const UnderdogAbilities = {
    Underdog: {
        "name": "Underdog",
        "icon": "/images/abilities/underdog.png",
    },
};

export const Underdog: Role = {
    "name": "Underdog",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/underdog.png",
    "description": "Ma przedłużony czas odnowienia zabicia, który skraca się gdy jest sam.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Kill Cooldown Bonus': {
            value: 5, type: SettingTypes.Time,
        },
        'Increased Kill Cooldown When 2+ Imps': {
            value: true, type: SettingTypes.Boolean,
        },
    },
    "abilities": [UnderdogAbilities.Underdog],
};