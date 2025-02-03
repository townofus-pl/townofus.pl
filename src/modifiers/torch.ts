import {
    probabilityOfAppearing,
    type Role,
    SettingTypes,
    Teams,
} from "@/constants";

export const TorchAbilities = {
    Torch: {
        "name": "Torch",
        "icon": "/images/abilities/torch.png",
    },
};

export const Torch: Role = {
    "name": "Torch",
    "color": "#FFFFFF",
    "team": Teams.Crewmate,
    "icon": "/images/roles/torch.png",
    "description": "Widoczność nie zmniejsza się podczas sabotażu świateł.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [TorchAbilities.Torch],
};