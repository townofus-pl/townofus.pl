import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";

export const VigilanteAbilities = {
    Guess: {
        "name": "Guess (Zgadnij)",
        "icon": "/images/abilities/guess.png"
    },
};

export const Vigilante: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Vigilante",
    "id": "vigilante",
	"color": "#FFFF99",
    "team": Teams.Crewmate,
    "icon": "/images/roles/vigilante.png",
    "description": "Crewmate, który może zabijać podczas spotkań. Podczas spotkania, Vigilante może wybrać, kogo zabić, zgadując jego rolę. Jeśli jednak zgadnie źle, to sam ginie.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [VigilanteAbilities.Guess],
};
