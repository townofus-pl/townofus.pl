export type Ability = {
    name: string,
    icon: string
};

enum CommonAbilityNames {
    None = "None",
    Kill = "Kill",
    Vent = "Vent",
    Sabotage = "Sabotage",
}

export const CommonAbilities: Record<CommonAbilityNames, Ability> = {
    [CommonAbilityNames.None]: {
        "name": "brak",
        "icon": "/images/abilities/none.png"
    },
    [CommonAbilityNames.Kill]: {
        "name": "Kill (Zabij)",
        "icon": "/images/abilities/kill.png"
    },
    [CommonAbilityNames.Vent]: {
        "name": "Vent (Wejdź do wentylacji)",
        "icon": "/images/abilities/vent.png"
    },
    [CommonAbilityNames.Sabotage]: {
        "name": "Sabotage (Sabotuj)",
        "icon": "/images/abilities/sabotage.png"
    },
}
