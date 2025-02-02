import {probabilityOfAppearing, Role, RoleSettingTypes, Teams} from "./shared";

export const LookoutAbilities = {
    Watch: {
        "name": "Watch (Obserwuj)",
        "icon": "/images/abilities/Watch.png"
    }
};

export const Lookout: Role = {
    "name": "Lookout",
    "color": "#33FF66",
    "team": Teams.Crewmate,
    "icon": "/images/roles/lookout.png",
    "description": "Crewmate, który może obserwować innych graczy podczas rundy. Podczas spotkania zobaczy wszystkie role, które wchodziły w interakcję z obserwowanym graczem.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Watch Cooldown": {
            value: 25,
            type: RoleSettingTypes.Time,
        },
        "Lookout Watches Reset After Each Round": {
            value: 1,
            type: RoleSettingTypes.Boolean,
        },
        "Maximum Number Of Players That Can Be Watched": {
            value: 5,
            type: RoleSettingTypes.Number,
        }
    },
    "abilities": [LookoutAbilities.Watch]
}
