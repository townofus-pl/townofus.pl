import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";


export const Aftermath: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Aftermath",
    "id": "aftermath",
	"color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/modifiers/placeholder.png",
    "description": "Zmusza zabójcę do użycia jego zdolności specjalnej po śmierci (np. Blackmailer po zabiciu Aftermath zostaje sam zblackmailowany na kolejne głosowanie).",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
