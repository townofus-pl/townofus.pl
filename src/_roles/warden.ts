import {
    probabilityOfAppearing,
    RoleSettingTypes,
    Teams,
    type Role,
    CommonRoleAbilities,
} from "./shared";

export const WardenAbilities = {
    Fortify: {
        "name": "Fortify (Fortyfikuj)",
        "icon": "/images/abilities/Fortify.png"
    },
};

export const Warden: Role = {
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
