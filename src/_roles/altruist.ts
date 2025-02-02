import {
    probabilityOfAppearing,
    RoleSettingTypes,
    Teams,
    type Role,
} from "./shared";

export const AltruistAbilities = {
    Revive: {
        "name": "Revive (Wskrześ)",
        "icon": "/images/abilities/revive.png"
    }
}

export const Altruist: Role = {
    "name": "Altruist",
    "color": "#660000",
    "team": Teams.Crewmate,
    "icon": "/images/roles/altruist.png",
    "description": "Crewmate, który ma zdolność wskrzeszania martwych graczy. Po znalezieniu martwego ciała, Altruist może poświęcić siebie dla wskrzeszenia innego gracza. Jeśli wskrzeszenie zostanie aktywowane, martwe ciało znika, pozostawiając tylko ciało Altruisty na miejscu. Po określonym czasie gracz zostanie wskrzeszony, o ile proces wskrzeszenia nie zostanie w jakiś sposób przerwany.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Altruist Revive Duration': {
            value: 1,
            type: RoleSettingTypes.Time,
        },
        "Target's Body Disappears On Beginning Of Revive": {
            value: 0,
            type: RoleSettingTypes.Boolean,
        },
    },
    "abilities": [AltruistAbilities.Revive],
};
