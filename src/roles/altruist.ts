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
    "id": "altruist",
	"color": "#660000",
    "team": Teams.Crewmate,
    "icon": "/images/roles/altruist.png",
    "description": "Crewmate, który ma zdolność wskrzeszania martwych graczy. Po znalezieniu martwych ciał, Altruist może wskrzesić graczy w swojej okolicy. Gdy proces wskrzeszenia zostanie aktywowany, Altruista nie może się poruszać oraz każdemu zabójcy wyświetli się strzałka w jego stronę. Po określonym czasie gracze zostaną wskrzeszeni, o ile proces wskrzeszenia nie zostanie w jakiś sposób przerwany. Po wskrzeszeniu, zarówno Altruista jak i wskrzeszeni gracze nie mogą wcisnąć przycisku emergency.",
    "settings": {
        ...probabilityOfAppearing(0),
        'Altruist Revive Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Revive Uses': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Revive Radius': {
            value: 0.5,
            type: SettingTypes.Multiplier,
        },
    },
    "abilities": [AltruistAbilities.Revive],
};
