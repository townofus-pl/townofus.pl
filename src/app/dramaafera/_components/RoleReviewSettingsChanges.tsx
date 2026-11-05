import { SettingTypes } from '@/constants/settings';
import type { RoleSettingChange } from '../host/_utils/roleSettings';
import { resolveEditorField } from '../host/_utils/editorFields';
import { formatValue, normalizeSettingValue } from '../_utils/formatSettingValue';
import { SettingsChangesCard } from './SettingsChangesCard';

export function RoleReviewSettingsChanges({ role, color, icon, changes }: {
    role: string; color: string; icon: string; changes: RoleSettingChange[];
}) {
    return <SettingsChangesCard name={role} color={color} icon={icon} changes={changes.map(change => {
        const field = resolveEditorField({ id: JSON.stringify([change.section, change.key]), section: change.section,
            key: change.key, value: change.before, line: 0, prefix: '', suffix: '' });
        const type = field.unit === '%' ? SettingTypes.Percentage : field.unit === 's' ? SettingTypes.Time
            : field.unit === '×' ? SettingTypes.Multiplier : /^(true|false)$/i.test(change.before) ? SettingTypes.Boolean
                : /^[-+]?\d+(?:[.,]\d+)?$/.test(change.before) ? SettingTypes.Number : SettingTypes.Text;
        const format = (value: string) => formatValue(normalizeSettingValue(value, type), type, field.description) || '(puste)';
        return { name: change.label, before: format(change.before), after: format(change.after) };
    })} />;
}
