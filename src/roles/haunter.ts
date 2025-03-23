import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Haunter: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Haunter",
    "id": "haunter",
	"color": "#D4D4D4",
    "team": Teams.Crewmate,
    "icon": "/images/roles/haunter.png",
    "description": "Martwy Crewmate, który po ukończeniu wszystkich zadań ujawnia Impostorów. Jest to rola pośmiertna, losowy Crewmate dostaje ją po śmierci. Gdy wykona wszystkie zadania, Impostorzy zostają ujawnieni żywym Crewmate’om po wezwaniu spotkania. Gdy Haunterowi zostanie ostatnie zadanie, Impostorzy dostają alert. Jako Haunter gracz jest półprzezroczysty. Jednak jeśli Haunter zostanie odnaleziony i kliknięty, traci swoją zdolność ujawniania Impostorów i staje się zwykłym duchem.",
    "settings": {
        ...probabilityOfAppearing(0),
            "When Haunter Can Be Clicked": {
                value: 5,
                type: SettingTypes.Number,
            },
            "Haunter Alert": {
                value: 1,
                type: SettingTypes.Number,
            },
            "Haunter Reveals Neutral Roles": {
                value: false,
                type: SettingTypes.Boolean,
            },
            "Who can Click Haunter": {
                value: "All",
                type: SettingTypes.Text,
            },
    },
    "abilities": [CommonAbilities.None],
};
