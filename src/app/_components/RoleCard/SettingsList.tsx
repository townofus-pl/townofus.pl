import {RoleSetting, RoleSettingTypes} from "@/_roles/shared";
import {FC} from "react";

export type SettingsListProps = {
    settings: Record<string, RoleSetting>;
}

const getValue = (setting: RoleSetting) => {
    switch (setting.type) {
        case RoleSettingTypes.Percentage:
            if (setting.value < 0) return 'x%';
            return `${setting.value}%`;
        case RoleSettingTypes.Time:
            return `${setting.value}s`;
        case RoleSettingTypes.Boolean:
            return setting.value ? '✓' : '✗';
        case RoleSettingTypes.Number:
            return setting.value.toString();
        case RoleSettingTypes.Radius:
            return `${setting.value}x`;
        default:
            return setting.value.toString();
    }
}

export const SettingsList: FC<SettingsListProps> = ({ settings }) => {
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