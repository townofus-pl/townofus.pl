import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";

export const WardenAbilities = {
    Fortify: {
        "name": "Fortify (Fortyfikuj)",
        "icon": "/images/abilities/Fortify.png"
    },
};

export const Warden: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Warden",
    "color": "#9900FF",
    "team": Teams.Crewmate,
    "icon": "/images/roles/warden.png",
    "description": "Crewmate, który może fortyfikować innych graczy. Ufortyfikowani gracze są odporni na wszelkiego rodzaju interkacje poza zabójstwem. Jeśli ktoś spróbuje interagować z ufortyfikowanym graczem, zarówno Warden, jak i osoba próbująca interakcji, otrzymują alert.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [WardenAbilities.Fortify],
};
