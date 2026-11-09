export function parseSections(content: string): Array<{ name: string; entries: Array<{ key: string; value: string }> }> {
    const sections: Array<{ name: string; entries: Array<{ key: string; value: string }> }> = [];

    for (const line of content.split(/\r?\n/).map(line => line.trim())) {
        if (!line || line.startsWith("#")) continue;
        if (line.startsWith("[") && line.endsWith("]")) {
            sections.push({ name: line.slice(1, -1).trim(), entries: [] });
            continue;
        }

        const equalsIndex = line.indexOf("=");
        if (equalsIndex === -1 || sections.length === 0) continue;
        sections[sections.length - 1].entries.push({
            key: line.slice(0, equalsIndex).trim(),
            value: line.slice(equalsIndex + 1).trim(),
        });
    }

    return sections;
}

export function settingId(section: string, key: string): string {
    return JSON.stringify([section, key]);
}
