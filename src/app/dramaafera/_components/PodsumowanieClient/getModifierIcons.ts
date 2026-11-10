import { MiraModifiers } from '@/mira/modifiers';

function modifierKey(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getModifierIcons(names: string[]) {
    return names.flatMap(name => {
        const key = modifierKey(name);
        // Game data uses Lover, while the Mira registry calls it Lovers.
        const nameKey = key === 'lover' ? 'lovers' : key;
        const modifier = MiraModifiers.find(modifier =>
            modifierKey(modifier.name) === nameKey || modifierKey(modifier.id) === key,
        );

        return modifier?.icon ? [{ name: modifier.name, icon: modifier.icon }] : [];
    });
}
