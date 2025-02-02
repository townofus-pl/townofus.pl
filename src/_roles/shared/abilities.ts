export type RoleAbility = {
    name: string,
    icon: string
};

export const CommonRoleAbilities: Record<string, RoleAbility> = {
    None: {
        "name": "brak",
        "icon": "/images/abilities/none.png"
    },
    Kill: {
        "name": "Kill (Zabij)",
        "icon": "/images/abilities/kill.png"
    },
    Vent: {
        "name": "Vent (Wejdź do wentylacji)",
        "icon": "/images/abilities/vent.png"
    },
    Sabotage: {
        "name": "Sabotage (Sabotuj)",
        "icon": "/images/abilities/sabotage.png"
    },
}
