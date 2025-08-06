import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const ClericAbilities = {
    Cleanse: {
        "name": "Cleanse (Oczyść)",
        "icon": "/images/abilities/cleanse.png"
    },
    Barrier: {
        "name": "Barrier (Nałóż Barierę)",
        "icon": "/images/abilities/barrier.png"
    }
};

export const Cleric: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Cleric",
    "id": "cleric",
    "color": "#00FFB2",
    "team": Teams.Crewmate,
    "icon": "/images/roles/cleric.png",
    "description": (<>
        <p>Crewmate z dwiema umiejętnościami:</p>
        <ul className="list-disc list-inside">
            <li>Oczyszczenie - usuwa negatywne efekty z danego gracza.</li>
            <li>Bariera - która daje czasową ochronę graczowi.</li>
        </ul>
    </>),
    "settings": {
        ...probabilityOfAppearing(0),
        "Barrier Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Show Barriered Player": {
            value: "Cleric",
            type: SettingTypes.Text,
            description: {
                0: "Self",
                1: "Cleric",
                2: "Self+Cleric"
            }
        },
        "Cleric Gets Attack Notification": {
            value: true,
            type: SettingTypes.Boolean
        }
    },
    "abilities": [ClericAbilities.Cleanse, ClericAbilities.Barrier],
}
