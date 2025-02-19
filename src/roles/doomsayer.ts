import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";

export const DoomsayerAbilities = {
    Observe: {
        "name": "Observe (Obserwuj)",
        "icon": "/images/abilities/observe.png"
    }
};

export const Doomsayer: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Doomsayer",
    "id": "doomsayer",
	"color": "#00d96d",
    "team": Teams.Neutral,
    "icon": "/images/roles/doomsayer.png",
    "description": "Wygrywa grę, jeśli zgadnie role trzech graczy. Posiada dodatkową umiejętność obserwowania gracza, która podpowiada mu jaką rolę może mieć wybrany gracz.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [DoomsayerAbilities.Observe],
};
