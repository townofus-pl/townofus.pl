export type RoleAbility = {
    name: string,
    icon: string
};

export enum CommonRoleAbilitiesNames {
    None = "None"
}

export const CommonRoleAbilities: Record<CommonRoleAbilitiesNames, RoleAbility> = {
    [CommonRoleAbilitiesNames.None]: {
        "name": "brak",
        "icon": "/images/abilities/none.png"
    }
}
