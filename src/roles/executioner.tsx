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
            description: {
                0: "Crewmate",
                1: "Amnesiac",
                2: "Mercenary",
                3: "Survivor",
                4: "Jester"
            }
        },
        "Executioner Can Button": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Executioner Win": {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: "Lives to see target voted out",
                1: "Executed"
            }
        },
        "Executioner Torments Player On Victory": {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [CommonAbilities.None],
};

