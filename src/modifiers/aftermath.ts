import {
    probabilityOfAppearing,
    type Role,
    Teams,
    CommonAbilities
} from "@/constants";

export const Aftermath: Role = {
    "name": "Aftermath",
    "color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/roles/aftermath.png",
    "description": "Zmusza zabójcę do użycia jego zdolności po śmierci (np. Blackmailer po zabiciu Aftermath zostaje sam zblackmailowany na kolejne głosowanie).",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};