import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const PlumberAbilities = {
    Flush: {
        "name": "Flush (Wypłucz)",
        "icon": "/images/abilities/flush.png"
    },
    Block: {
        "name": "Block (Nałóż Blokadę)",
        "icon": "/images/abilities/block.png"
    }
};

export const Plumber: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Plumber",
    "id": "plumber",
    "color": "#CC6600",
    "team": Teams.Crewmate,
    "icon": "/images/roles/plumber.png",
    "description": (<>
        <p>Crewmate z 2 umiejętnościami:</p>
        <ul className="list-disc list-inside">
            <li>Wypłukanie - wyrzuca wszystkich graczy z wentów – Plumber przez 1 sekundę widzi strzałkę wskazującą wypchniętych graczy.</li>
            <li>Blokada - stawia barykadę na wentach, uniemożliwiając ich użycie od następnej rundy.</li>
        </ul>
    </>),
    "settings": {
        ...probabilityOfAppearing(0),
        "Flush Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Maximum Number Of Barricades": {
            value: 5,
            type: SettingTypes.Number,
        },
    },
    "abilities": [PlumberAbilities.Flush, PlumberAbilities.Block],
}
