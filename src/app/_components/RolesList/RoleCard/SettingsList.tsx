import {Setting, SettingTypes} from "@/constants/settings";

const getValue = (setting: Setting) => {
    switch (setting.type) {
        case SettingTypes.Percentage:
            if ((setting.value as number) < 0) return 'x%';
            return `${setting.value}%`;
        case SettingTypes.Time:
            return `${setting.value}s`;
        case SettingTypes.Boolean:
            return setting.value ? '✓' : '✗';
        case SettingTypes.Number:
            return setting.value.toString();
        case SettingTypes.Multiplier:
            return `${setting.value}x`;
        case SettingTypes.Text:
        default:
            return setting.value.toString();
    }
}

export const SettingsList = ({settings}: {
    settings: Record<string, Setting>;
}) => {
    return (
        <div>
            <h5 className="font-brook text-5xl mb-2.5">Ustawienia</h5>
            <ul className="text-xl">
                {Object.entries(settings).map(([name, setting]) => (
                    <li key={name}>{name}: {getValue(setting)}</li>
                ))}
            </ul>
        </div>
    );
}
