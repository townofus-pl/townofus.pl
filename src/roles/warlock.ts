import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Warlock: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Warlock",
    "id": "warlock",
	"color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/warlock.png",
    "description": "Impostor, który może zabijać bez cooldownu, o ile ma naładowaną manę. W czasie rozgrywki, Warlockowi ładuje się mana. Manę mierzy się w procentach. W pełni naładowana mana (100%) pozwala na zabijanie bez cooldownu przez określony czas. W przypadku gdy mana nie jest naładowana do pełna, czas na nieograniczone zabijanie jest proporcjonalnie mniejszy.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Time It Takes To Fully Charge": {
            value: 25.0,
            type: SettingTypes.Time,
        },
        "Time It Takes To Use Full Charge": {
            value: 1.0,
            type: SettingTypes.Time,
        },

    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Vent, CommonAbilities.Sabotage],
};
