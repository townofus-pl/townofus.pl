import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

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
        ...probabilityOfAppearing(0),
        "Observe Cooldown": {
            value: 10,
            type: SettingTypes.Time,
        },
        "Doomsayer Guesses All Roles At Once": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Doomsayer Can't Observe": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Doomsayer Win Ends Game": {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [DoomsayerAbilities.Observe],
};
