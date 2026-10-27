import { normalizeRoleName } from './gameUtils';

/** Spellings accepted in persisted role histories (IdPart, display name and legacy bundles). */
export function getRoleAliases(roleName: string, seasonId: number): string[] {
    const canonical = normalizeRoleName(roleName, seasonId);
    const names = [roleName, canonical, ...canonical.split(' / ')];
    return Array.from(new Set(names.flatMap(name => {
        const compact = name.replace(/[^a-z0-9]/gi, '');
        const snake = name.replace(/\s+/g, '_');
        return [name, compact, snake, name.toLowerCase(), compact.toLowerCase(), snake.toLowerCase()];
    })));
}
