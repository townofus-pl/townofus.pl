export type Ability = {
    name: string,
    icon: string
};

enum CommonRoleAbilityNames {
    None = "None",
    Kill = "Kill",
    Vent = "Vent",
    Sabotage = "Sabotage",
}

export const CommonRoleAbilities: Record<CommonRoleAbilityNames, Ability> = {
    [CommonRoleAbilityNames.None]: {
        "name": "brak",
        "icon": "/images/abilities/none.png"
    },
    [CommonRoleAbilityNames.Kill]: {
        "name": "Kill (Zabij)",
        "icon": "/images/abilities/kill.png"
    },
    [CommonRoleAbilityNames.Vent]: {
        "name": "Vent (Wejdź do wentylacji)",
        "icon": "/images/abilities/vent.png"
    },
    [CommonRoleAbilityNames.Sabotage]: {
        "name": "Sabotage (Sabotuj)",
        "icon": "/images/abilities/sabotage.png"
    },
}
