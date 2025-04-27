import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const MercenaryAbilities = {
    Guard: {
        "name": "Guard (Chroń)",
        "icon": "/images/abilities/guard.png"
    },
    Bribe: {
        "name": "Bribe (Przekup)",
        "icon": "/images/abilities/bribe.png"
    },
};

export const Mercenary: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Mercenary",
    "id": "mercenary",
	"color": "#8C6699",
    "team": Teams.Neutral,
    "icon": "/images/roles/placeholder.png",
    "description": (<>
        <p>Neutralna rola z dwiema umiejętnościami.</p>
        <ul className="list-disc list-inside">
            <li>Ochrona - pozwala chronić gracza. Jeśli ktoś nawiąże interakcję z chronionym graczem, Mercenary dostaje walutę.</li>
            <li>Przekupienie gracza - można użyć przy odpowiedniej ilości waluty. Jeśli przekupiony gracz wygra (nie będąc Neutral Benign, Neutral Evil ani w relacji Lovers), Mercenary także wygrywa. Przekupiony gracz dowiaduje się, że został przekupiony (jeśli nie jest Neutral Benign ani Neutral Evil).</li>
        </ul>
    </>),
    "settings": {
        ...probabilityOfAppearing(0),
        "Guard Cooldown": {
            value: 10,
            type: SettingTypes.Time,
        },
        "Maximum Number Of Guards": {
            value: 3,
            type: SettingTypes.Number,
        },
        "Gold to Bribe": {
            value: 3,
            type: SettingTypes.Number,
        },
    },
    "abilities": [MercenaryAbilities.Guard, MercenaryAbilities.Bribe],
};
