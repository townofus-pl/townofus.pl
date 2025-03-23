import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const PresidentAbilities = {
    Abstain: {
        "name": "Abstain (Wstrzymaj się)",
        "icon": "/images/abilities/abstain.png"
    },
};

export const President: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "President",
    "id": "president",
	"color": "#660099",
    "team": Teams.Crewmate,
    "icon": "/images/roles/politician.png", //ten sam obrazek
    "description": "Crewmate, który może głosować kilka razy. Co każdy meeting otrzymuje jeden głos który może użyć albo zachować, jeśli wstrzyma się od głosu, będzie miał dodatkowy głos na następnym spotkaniu.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Initial President Vote Bank": {
            value: 1,
            type: SettingTypes.Number,
        },
        "President Votes Show Anonymous": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [PresidentAbilities.Abstain],
};
