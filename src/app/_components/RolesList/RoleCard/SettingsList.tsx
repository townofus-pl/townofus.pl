import {Setting, SettingTypes} from "@/constants/settings";

export const getValue = (setting: Setting) => {
    // Najpierw sprawdź czy istnieje opis dla wartości
    if (setting.description) {
        let valueToCheck: number | null = null;
        
        if (typeof setting.value === 'number') {
            valueToCheck = setting.value;
        } else if (typeof setting.value === 'string') {
            const parsed = parseInt(setting.value);
            if (!isNaN(parsed)) {
                valueToCheck = parsed;
            }
        }
        
        if (valueToCheck !== null && setting.description[valueToCheck]) {
            return setting.description[valueToCheck];
        }
    }

    // Jeśli nie ma opisu lub wartość nie pasuje, użyj standardowego formatowania
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
