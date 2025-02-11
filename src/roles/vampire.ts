import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";

export const VampireAbilities = {
    Bite: {
        "name": "Bite (Ugryź)",
        "icon": "/images/abilities/bite.png"
    },
};

export const Vampire: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Vampire",
    "id": "vampire",
	"color": "#747474",
    "team": Teams.Neutral,
    "icon": "/images/roles/vampire.png",
    "description": "Neutralna rola z własnym warunkiem zwycięstwa. Vampire może konwertować lub zabijać innych graczy poprzez ugryzienie. Jeżeli w grze jest jeden żywy wampir, ugryzienie Crewmate zamieni go w drugiego vampira. Jeżeli w grze jest dwóch wampirów lub cel nie jest Crewmate'em, ugryziony umrze.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [VampireAbilities.Bite],
};
