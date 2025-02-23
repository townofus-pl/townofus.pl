import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Phantom: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Phantom",
    "id": "phantom",
	"color": "#662966",
    "team": Teams.Neutral,
    "icon": "/images/roles/phantom.png",
    "description": "Neutralna rola z własnym warunkiem zwycięstwa. Po śmierci staje się półniewidzialny i musi ukończyć wszystkie swoje zadania, nie dając się złapać. Phantoma można złapać poprzez kliknięcie na niego.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "When Phantom Can Be Clicked": {
            value: 5,
            type: SettingTypes.Number,
        },
        "Phantom Spook On Victory": {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.None],
};
