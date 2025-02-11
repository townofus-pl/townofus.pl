import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

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
    "type": RoleOrModifierTypes.Role,
    "name": "Venerer",
    "id": "venerer",
	"color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/venerer.png",
    "description": (<>
            <p>
            Venerer to Impostor, który zdobywa zdolności poprzez zabijanie.
            </p>
            <ul>
            <li>Po swoim pierwszym zabójstwie, Venerer może się zakamuflować.</li>
            <li>Po drugim zabójstwie, Venerer może szybciej biegać.</li>
            <li>Po trzecim zabójstwie, po aktywowaniu zdolności, wszyscy inni gracze są spowolnieni.</li>
            </ul>
            <p>
            Wszystkie zdolności są aktywowane jednym przyciskiem i mają tę samą długość trwania.
            </p>
        </>),
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [
        CommonAbilities.Kill,
        CommonAbilities.Vent,
        CommonAbilities.Sabotage,
        VenererAbilities.Camouflage,
        VenererAbilities.CamoSprint,
        VenererAbilities.CamoSprintFreeze,
    ],
};
