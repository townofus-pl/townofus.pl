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
    Crewmate = 'Crewmate',
    Survivor = 'Survivor',
}

export enum Distances {
    Short = 'Short',
    Medium = 'Medium',
    Long = 'Long',
}

export type Setting = {
    value: number,
    type: SettingTypes.Percentage | SettingTypes.Time | SettingTypes.Number | SettingTypes.Multiplier,
    description?: Record<number, string>
} | {
    value: boolean,
    type: SettingTypes.Boolean,
    description?: Record<number, string>
} | {
    value: string,
    type: SettingTypes.Text,
    description?: Record<number, string>
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
