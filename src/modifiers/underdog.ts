import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Underdog: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Underdog",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Ma przedłużony czas odnowienia zabicia, który skraca się gdy jest sam.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Kill Cooldown Bonus': {
            value: 5, type: SettingTypes.Time,
        },
        'Increased Kill Cooldown When 2+ Imps': {
            value: true, type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.None],
};
