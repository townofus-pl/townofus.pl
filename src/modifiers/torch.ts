import {CommonAbilities, probabilityOfAppearing, type Role, Teams} from "@/constants";


export const Torch: Role = {
    "name": "Torch",
    "color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/roles/torch.png",
    "description": "Widoczność nie zmniejsza się podczas sabotażu świateł.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [CommonAbilities.None],
};
