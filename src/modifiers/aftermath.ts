import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";


export const Aftermath: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Aftermath",
    "id": "aftermath",
	"color": "#A6FFA6",
    "team": Teams.Crewmate,
    "icon": "/images/modifiers/aftermath.png",
    "description": "Zmusza zabójcę do użycia jego zdolności specjalnej po śmierci (np. Blackmailer po zabiciu Aftermath zostaje sam zblackmailowany na kolejne głosowanie).",
    "settings": {
        ...probabilityOfAppearing(0),
    },
    "abilities": [CommonAbilities.None],
};
