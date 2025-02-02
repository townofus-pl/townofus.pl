export type RoleAbility = {
    name: string,
    icon: string
};

enum CommonRoleAbilitiesNames {
    None = "None",
    Kill = "Kill",
    Vent = "Vent",
    Sabotage = "Sabotage",
}

export const CommonRoleAbilities: Record<CommonRoleAbilitiesNames, RoleAbility> = {
    [CommonRoleAbilitiesNames.None]: {
        "name": "brak",
        "icon": "/images/abilities/none.png"
    },
    [CommonRoleAbilitiesNames.Kill]: {
        "name": "Kill (Zabij)",
        "icon": "/images/abilities/kill.png"
    },
    [CommonRoleAbilitiesNames.Vent]: {
        "name": "Vent (Wejdź do wentylacji)",
        "icon": "/images/abilities/vent.png"
    },
    [CommonRoleAbilitiesNames.Sabotage]: {
        "name": "Sabotage (Sabotuj)",
        "icon": "/images/abilities/sabotage.png"
    },
}
