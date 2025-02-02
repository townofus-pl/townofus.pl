export enum RoleSettingTypes {
    Percentage = 'percentage',
    Time = 'time',
    Boolean = 'boolean',
    Number = 'number',
    Radius = 'radius',
    RoleAfterDeath = 'roleAfterDeath',
    Distance = 'distance',
}

export enum RolesAfterDeath {
    Jester = 1,
}

export enum Distances {
    Short = 1,
    Medium = 2,
    Long = 3,
}

export type RoleSetting = {
    value: number,
    type: RoleSettingTypes
};

export enum CommonRoleSettingsNames {
    ProbabilityOfAppearing = "Probability Of Appearing",
}

export const probabilityOfAppearing: (value: number) => Record<CommonRoleSettingsNames, RoleSetting> = value => ({
    [CommonRoleSettingsNames.ProbabilityOfAppearing]: {
        value,
        type: RoleSettingTypes.Percentage
    }
});
