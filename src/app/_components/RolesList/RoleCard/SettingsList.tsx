import {Setting, SettingTypes} from "@/constants/settings";

export const getValue = (setting: Setting) => {
    // Opis wartości ma pierwszeństwo dla każdego ustawienia, niezależnie od roli i jednostki.
    const numericValue = typeof setting.value === 'number'
        ? setting.value
        : typeof setting.value === 'string' && setting.value.trim() !== ''
            ? Number(setting.value.replace(/,/g, '.'))
            : NaN;
    const description = Number.isFinite(numericValue) ? setting.description?.[numericValue] : undefined;
    if (description !== undefined) {
        return description;
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
