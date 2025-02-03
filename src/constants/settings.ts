export enum SettingTypes {
    Percentage = 'percentage',
    Time = 'time',
    Boolean = 'boolean',
    Number = 'number',
    Text = 'text',
    Multiplier = 'multiplier',
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
    type: SettingTypes.Percentage | SettingTypes.Time | SettingTypes.Number | SettingTypes.Multiplier
} | {
    value: boolean,
    type: SettingTypes.Boolean
} | {
    value: string,
    type: SettingTypes.Text
};

export enum CommonSettingNames {
    ProbabilityOfAppearing = "Probability Of Appearing",
}

export const probabilityOfAppearing: (value: number) => Record<CommonSettingNames.ProbabilityOfAppearing, Setting> = value => ({
    [CommonSettingNames.ProbabilityOfAppearing]: {
        value,
        type: SettingTypes.Percentage
    }
});
