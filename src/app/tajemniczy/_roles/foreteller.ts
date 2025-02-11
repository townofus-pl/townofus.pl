import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";

export const ForetellerAbilities = {
    Observe: {
        "name": "Observe (Obserwuj)",
        "icon": "/images/abilities/observe.png"
    },
    Guess: {
        "name": "Guess (Zgadnij)",
        "icon": "/images/abilities/guess.png"
    },
};

export const Foreteller: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Foreteller",
    "id": "foreteller",
	"color": "#00d96d",
    "team": Teams.Neutral,
    "icon": "/images/roles/doomsayer.png", //ta sama ikonka
    "description": "Wygrywa grę, jeśli zgadnie role trzech graczy. Posiada dodatkową umiejętność obserwowania gracza, która podpowiada mu jaką rolę może mieć wybrany gracz.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [ForetellerAbilities.Observe, ForetellerAbilities.Guess],
};
