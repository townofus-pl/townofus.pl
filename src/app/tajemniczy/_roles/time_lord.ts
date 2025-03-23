import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";

export const TimeLordAbilities = {
    Reverse: {
        "name": "Reverse (Cofnij czas)",
        "icon": "/images/abilities/reverse.png"
    },
};

export const TimeLord: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Time Lord",
    "id": "time_lord",
	"color": "#4111C5",
    "team": Teams.Crewmate,
    "icon": "/images/roles/time_lord.png",
    "description": "Crewmate, który posiada umiejętność cofania czasu. Wszyscy gracze cofają się do swoich położeń sprzed paru sekund, cofają się również wszystkie interkacje.",
    "settings": {
        ...probabilityOfAppearing(0),
    },
    "abilities": [TimeLordAbilities.Reverse],
};
