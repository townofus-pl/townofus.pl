import {
    probabilityOfAppearing,
    RoleSettingTypes,
    Teams,
    type Role,
    CommonRoleAbilities,
} from "./shared";

export const VenererAbilities = {
    Camouflage: {
        "name": "Camouflage (Kamuflaż)",
        "icon": "/images/abilities/camouflage.png"
    },
    CamoSprint: {
        "name": "Camouflage + Sprint (Kamuflaż + Sprint)",
        "icon": "/images/abilities/camosprint.png"
    },
    CamoSprintFreeze: {
        "name": "Camouflage + Sprint + Freeze (Kamuflaż + Sprint + Spowolnienie)",
        "icon": "/images/abilities/camosprintfreeze.png"
    },
};

export const Venerer: Role = {
    "name": "Venerer",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/venerer.png",
    "description": "Venerer to Impostor, który zdobywa zdolności poprzez zabijanie. <br>Po swoim pierwszym zabójstwie, Venerer może się zakamuflować. <br>Po drugim zabójstwie, Venerer może szybciej biegać. <br>Po trzecim zabójstwie, po aktywowaniu zdolności, wszyscy inni gracze są spowolnieni. Wszystkie zdolności są aktywowane jednym przyciskiem i mają tę samą długość trwania.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [
        CommonRoleAbilities.Kill,
        CommonRoleAbilities.Vent,
        CommonRoleAbilities.Sabotage,
        VenererAbilities.Camouflage,
        VenererAbilities.CamoSprint,
        VenererAbilities.CamoSprintFreeze,
    ],
};
