import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, RolesAfterDeath, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Executioner: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Executioner",
    "id": "executioner",
	"color": "#8C4005",
    "team": Teams.Neutral,
    "icon": "/images/roles/executioner.png",
    "description": (<p>
        Neutralna rola z własnym warunkiem zwycięstwa. Jego celem jest <u>wygłosowanie</u> gracza, wskazanego na początku gry. Jeśli ten gracz zostanie wygnany, Executioner wygrywa grę. Jeśli cel zginie w inny sposób, Executioner zamienia się w inną rolę (zależną od ustawień).
        </p>),
    "settings": {
        ...probabilityOfAppearing(0),
        "Executioner Becomes On Target Dead": {
            value: RolesAfterDeath.Crewmate,
            type: SettingTypes.Text,
        },
        "Executioner Can Button": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Executioner Torments Player On Victory": {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [CommonAbilities.None],
};

