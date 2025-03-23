import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Traitor: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Traitor",
    "id": "traitor",
	"color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/traitor.png",
    "description": "Jeśli wszyscy Impostorzy zginą przed określonym momentem w grze, losowy Crewmate zostaje wybrany na Traitora. Traitor nie ma dodatkowych zdolności, a jego zadaniem jest pomścić martwych Impostorów. Po przemianie w Traitora, gracz dołącza do drużyny Impostorów.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Minimum People Alive When Traitor Can Spawn": {
            value: 5,
            type: SettingTypes.Number,
        },
        "Traitor Won't Spawn if Neutral Killing are Alive": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Vent, CommonAbilities.Sabotage],
};
