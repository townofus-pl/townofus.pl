export enum SettingTypes {
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

export type Setting = {
    value: number,
    type: SettingTypes.Percentage | SettingTypes.Time | SettingTypes.Number | SettingTypes.Radius
} | {
    value: boolean,
    type: SettingTypes.Boolean
} | {
    value: string,
    type: SettingTypes.Text
};

export enum CommonRoleSettingNames {
    ProbabilityOfAppearing = "Probability Of Appearing",
}

export const probabilityOfAppearing: (value: number) => Record<CommonRoleSettingNames.ProbabilityOfAppearing, Setting> = value => ({
    [CommonRoleSettingNames.ProbabilityOfAppearing]: {
        value,
        type: SettingTypes.Percentage
    }
});
