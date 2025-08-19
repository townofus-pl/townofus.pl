import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const WardenAbilities = {
    Fortify: {
        "name": "Fortify (Fortyfikuj)",
        "icon": "/images/abilities/fortify.png"
    },
};

export const Warden: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Warden",
    "id": "warden",
	"color": "#9900FF",
    "team": Teams.Crewmate,
    "icon": "/images/roles/warden.png",
    "description": "Crewmate, który może fortyfikować innych graczy. Ufortyfikowani gracze są odporni na wszelkiego rodzaju interkacje. Jeśli ktoś spróbuje interagować z ufortyfikowanym graczem, zarówno Warden, jak i osoba próbująca interakcji, otrzymują alert.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Show Fortified Player": {
            value: "Warden",
            type: SettingTypes.Text,
            description: {
                0: "Self",
                1: "Warden",
                2: "Self+Warden"
            }
        },
    },
    "abilities": [WardenAbilities.Fortify],
};
