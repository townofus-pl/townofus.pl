import {RoleSetting, RoleSettingTypes} from "@/roles/shared";

const getValue = (setting: RoleSetting) => {
    switch (setting.type) {
        case RoleSettingTypes.Percentage:
            if ((setting.value as number) < 0) return 'x%';
            return `${setting.value}%`;
        case RoleSettingTypes.Time:
            return `${setting.value}s`;
        case RoleSettingTypes.Boolean:
            return setting.value ? '✓' : '✗';
        case RoleSettingTypes.Number:
            return setting.value.toString();
        case RoleSettingTypes.Radius:
            return `${setting.value}x`;
        case RoleSettingTypes.Text:
        default:
            return setting.value.toString();
    }
}

export const SettingsList = ({settings}: {
    settings: Record<string, RoleSetting>;
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
