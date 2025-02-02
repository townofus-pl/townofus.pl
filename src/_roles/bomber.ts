import {
    probabilityOfAppearing,
    RoleSettingTypes,
    Teams,
    type Role,
    CommonRoleAbilities,
} from "./shared";

export const BomberAbilities = {
    Plant: {
        "name": "Plant (Postaw bombę)",
        "icon": "/images/abilities/plant.png"
    },
    Detonate: {
        "name": "Detonate (Detonuj)",
        "icon": "/images/abilities/detonate.png"
    },
};

export const Bomber: Role = {
    "name": "Bomber",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/bomber.png",
    "description": "Impostor, który ma zdolność stawiania bomb zamiast zabijania. Po posadzeniu bomby, ta wybuchnie po określonym czasie. Gdy bomba wybuchnie, zabije wszystkich graczy znajdujących się w zasięgu, także Impostorów.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Detonate Delay": {
            value: 5,
            type: RoleSettingTypes.Time,
        },
        "Max Kills In Detonation": {
            value: 10,
            type: RoleSettingTypes.Number,
        },
        "Detonate Radius": {
            value: 0.25,
            type: RoleSettingTypes.Radius,
        },
        "Bomber Can Vent": {
            value: true,
            type: RoleSettingTypes.Boolean,
        },
        "All Impostors See Bomb": {
            value: true,
            type: RoleSettingTypes.Boolean,
        },
    },
    "abilities": [CommonRoleAbilities.Vent, CommonRoleAbilities.Sabotage, BomberAbilities.Plant, BomberAbilities.Detonate],
};
