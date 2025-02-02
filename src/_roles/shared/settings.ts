export enum RoleSettingTypes {
    Percentage = 'percentage',
    Time = 'time',
    Boolean = 'boolean',
    Number = 'number',
    Radius = 'radius',
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
