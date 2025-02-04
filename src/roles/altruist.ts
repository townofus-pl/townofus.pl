import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const AltruistAbilities = {
    Revive: {
        "name": "Revive (Wskrześ)",
        "icon": "/images/abilities/revive.png"
    }
}

export const Altruist: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Altruist",
    "color": "#660000",
    "team": Teams.Crewmate,
    "icon": "/images/roles/altruist.png",
    "description": "Crewmate, który ma zdolność wskrzeszania martwych graczy. Po znalezieniu martwego ciała, Altruist może poświęcić siebie dla wskrzeszenia innego gracza. Jeśli wskrzeszenie zostanie aktywowane, martwe ciało znika, pozostawiając tylko ciało Altruisty na miejscu. Po określonym czasie gracz zostanie wskrzeszony, o ile proces wskrzeszenia nie zostanie w jakiś sposób przerwany.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Altruist Revive Duration': {
            value: 1,
            type: SettingTypes.Time,
        },
        "Target's Body Disappears On Beginning Of Revive": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [AltruistAbilities.Revive],
};
