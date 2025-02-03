export enum RoleSettingTypes {
    Percentage = 'percentage',
    Time = 'time',
    Boolean = 'boolean',
    Number = 'number',
    Radius = 'radius',
    Text = 'text',
}

export enum RolesAfterDeath {
    Jester = 'Jester',
    Amnesiac = 'Amnesiac',
}

export enum Distances {
    Short = 'Short',
    Medium = 'Medium',
    Long = 'Long',
}

export type RoleSetting = {
    value: number,
    type: RoleSettingTypes.Percentage | RoleSettingTypes.Time | RoleSettingTypes.Number | RoleSettingTypes.Radius
} | {
    value: boolean,
    type: RoleSettingTypes.Boolean
} | {
    value: string,
    type: RoleSettingTypes.Text
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
