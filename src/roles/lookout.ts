import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const LookoutAbilities = {
    Watch: {
        "name": "Watch (Obserwuj)",
        "icon": "/images/abilities/watch.png"
    }
};

export const Lookout: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Lookout",
    "id": "lookout",
	"color": "#33FF66",
    "team": Teams.Crewmate,
    "icon": "/images/roles/lookout.png",
    "description": "Crewmate, który może obserwować innych graczy podczas rundy. Podczas spotkania zobaczy wszystkie role, które wchodziły w interakcję z obserwowanym graczem.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Watch Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Lookout Watches Reset After Each Round": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Maximum Number Of Players That Can Be Watched": {
            value: 5,
            type: SettingTypes.Number,
        }
    },
    "abilities": [LookoutAbilities.Watch]
}
