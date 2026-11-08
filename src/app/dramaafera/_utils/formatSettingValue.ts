import { SettingTypes } from "@/constants/settings";

export function normalizeSettingValue(value: string, type: SettingTypes): string | number | boolean {
    switch (type) {
        case SettingTypes.Boolean:
            return value.toLowerCase() === "true";
        case SettingTypes.Number:
        case SettingTypes.Percentage:
        case SettingTypes.Time:
        case SettingTypes.Multiplier: {
            const parsed = Number(value.replace(/,/g, "."));
            if (Number.isNaN(parsed)) {
                return value;
            }

            return Number.isInteger(parsed) ? parsed : Number(parsed.toFixed(2));
        }
        case SettingTypes.Text:
        default:
            return value;
    }
}

export function formatValue(value: string | number | boolean, type: SettingTypes, description?: Record<number, string>): string {
    if (description) {
        let valueToCheck: number | null = null;

        if (typeof value === "number") {
            valueToCheck = value;
        } else if (typeof value === "string") {
            const parsed = Number(value);
            if (!Number.isNaN(parsed)) {
                valueToCheck = parsed;
            }
        }

        if (valueToCheck !== null && description[valueToCheck]) {
            return description[valueToCheck];
        }
    }

    switch (type) {
        case SettingTypes.Percentage:
            if (typeof value === "number" && value < 0) {
                return "x%";
            }

            return `${value}%`;
        case SettingTypes.Time:
            return `${value}s`;
        case SettingTypes.Boolean:
            return value ? "✓" : "✗";
        case SettingTypes.Number:
            return value.toString();
        case SettingTypes.Multiplier:
            return `${value}x`;
        case SettingTypes.Text:
        default:
            return value.toString();
    }
}
