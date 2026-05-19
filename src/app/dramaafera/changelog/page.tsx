import Image from "next/image";
import { Roles } from "../_roles";
import { Modifiers } from "@/modifiers";
import { SettingTypes } from "@/constants/settings";
import { Teams } from "@/constants/teams";
import { getDramaAferaSettings } from "../_services/getDramaAferaSettings";
import { getPrismaClient } from "@/app/api/_database";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = 'force-dynamic';

const getRoleInfo = (roleName: string): { color: string; icon: string | null } => {
    // Najpierw szukaj w rolach
    const role = Roles.find(r => r.name === roleName);
    if (role) {
        return {
            color: role.color,
            icon: role.icon
        };
    }
    
    // Jeśli nie znaleziono w rolach, szukaj w modyfikatorach
    const modifier = Modifiers.find(m => m.name === roleName);
    if (modifier) {
        return {
            color: modifier.color,
            icon: modifier.icon
        };
    }
    
    // Domyślne wartości dla Global Settings
    return {
        color: "#4B5563",
        icon: null
    };
};

// Pomocnicza funkcja do formatowania wartości
const formatValue = (value: string | number | boolean, type: SettingTypes, description?: Record<number, string>): string => {
    // Najpierw sprawdź czy istnieje opis dla wartości
    if (description) {
        let valueToCheck: number | null = null;
        
        if (typeof value === 'number') {
            valueToCheck = value;
        } else if (typeof value === 'string') {
            const parsed = parseInt(value);
            if (!isNaN(parsed)) {
                valueToCheck = parsed;
            }
        }
        
        if (valueToCheck !== null && description[valueToCheck]) {
            return description[valueToCheck];
        }
    }

    // Jeśli nie ma opisu lub wartość nie pasuje, użyj standardowego formatowania
    switch (type) {
        case SettingTypes.Percentage:
            if ((value as number) < 0) return 'x%';
            return `${value}%`;
        case SettingTypes.Time:
            return `${value}s`;
        case SettingTypes.Boolean:
            return value ? '✓' : '✗';
        case SettingTypes.Number:
            return value.toString();
        case SettingTypes.Multiplier:
            return `${value}x`;
        case SettingTypes.Text:
        default:
            return value.toString();
    }
};

interface Change {
    roleName: string;
    settingName: string;
    oldValue: string;
    newValue: string;
    type: 'role' | 'setting';
}

async function getChanges(prisma: Awaited<ReturnType<typeof getPrismaClient>>): Promise<Change[]> {
    try {
        const { current: currentContent, old: oldContent } = await getDramaAferaSettings(prisma);

        if (!currentContent) {
            return [];
        }

        // Jeśli brak starej wersji — to są pierwsze zmiany, bez porównania
        if (!oldContent) {
            return [];
        }

        // Parsowanie plików - ta sama logika co w SettingsDramaAfera
        const parseFile = (content: string) => {
            const lines = content.split('\n').map(line => line.trim());
            const fileContentMap = new Map<string, string>();
            const cleanedFileContentMap = new Map<string, number>();

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes('<color=') && line.includes('</color>')) {
                    const extractName = (line: string): string => {
                        const match = line.match(/<color=#[A-F0-9]{8}>(.*?)<\/color>/);
                        return match ? match[1] : line;
                    };
                    
                    const name = extractName(line);
                    const nextLine = lines[i + 1];
                    if (nextLine && !isNaN(Number(nextLine))) {
                        const value = Number(nextLine);
                        cleanedFileContentMap.set(name, value);
                        i++; // Pomiń następną linię, która jest wartością
                    }
                } else if (line && !line.includes('<color=') && i + 1 < lines.length) {
                    const nextLine = lines[i + 1];
                    if (nextLine && nextLine.trim() !== '') {
                        fileContentMap.set(line, nextLine);
                        i++; // Pomiń następną linię, która jest wartością
                    }
                }
            }

            return { fileContentMap, cleanedFileContentMap };
        };

        const currentData = parseFile(currentContent);
        const oldData = parseFile(oldContent);

        const detectedChanges: Change[] = [];

        // Sprawdź zmiany w prawdopodobieństwach ról
        for (const [roleName, currentProb] of currentData.cleanedFileContentMap) {
            const oldProb = oldData.cleanedFileContentMap.get(roleName);
            if (oldProb !== undefined && oldProb !== currentProb) {
                detectedChanges.push({
                    roleName,
                    settingName: 'Probability Of Appearing',
                    oldValue: `${oldProb}%`,
                    newValue: `${currentProb}%`,
                    type: 'role'
                });
            }
        }

        // Sprawdź zmiany w ustawieniach
        for (const [settingName, currentValue] of currentData.fileContentMap) {
            const oldValue = oldData.fileContentMap.get(settingName);
            if (oldValue !== undefined && oldValue !== currentValue) {
                // Znajdź odpowiednią rolę i ustawienie, żeby określić typ
                let settingType = SettingTypes.Text;
                let description: Record<number, string> | undefined;
                let roleName = 'Global Settings';

                // Przeszukaj role, żeby znaleźć to ustawienie
                for (const role of Roles) {
                    if (role.settings[settingName]) {
                        settingType = role.settings[settingName].type;
                        description = role.settings[settingName].description;
                        roleName = role.name;
                        break;
                    }
                }

                // Jeśli nie znaleziono w rolach, przeszukaj modyfikatory
                if (roleName === 'Global Settings') {
                    for (const modifier of Modifiers) {
                        if (modifier.settings[settingName]) {
                            settingType = modifier.settings[settingName].type;
                            description = modifier.settings[settingName].description;
                            roleName = modifier.name;
                            break;
                        }
                    }
                }

                // Formatuj wartości z zaokrąglaniem
                const processValue = (value: string, type: SettingTypes) => {
                    switch (type) {
                        case SettingTypes.Boolean:
                            return value.toLowerCase() === 'true';
                        case SettingTypes.Number:
                        case SettingTypes.Percentage:
                        case SettingTypes.Time:
                        case SettingTypes.Multiplier: {
                            const num = Number(value.replace(/,/g, '.'));
                            return !isNaN(num) ? (Number.isInteger(num) ? num : Number(num.toFixed(2))) : num;
                        }
                        case SettingTypes.Text:
                        default:
                            return value;
                    }
                };

                const processedOldValue = processValue(oldValue, settingType);
                const processedNewValue = processValue(currentValue, settingType);

                const formattedOldValue = formatValue(processedOldValue, settingType, description);
                const formattedNewValue = formatValue(processedNewValue, settingType, description);

                detectedChanges.push({
                    roleName,
                    settingName,
                    oldValue: formattedOldValue,
                    newValue: formattedNewValue,
                    type: 'setting'
                });
            }
        }

        return detectedChanges;
    } catch (error) {
        console.error('Błąd podczas ładowania zmian:', error);
        return [];
    }
}

export default async function ChangelogPage() {
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);
    const changes = await getChanges(prisma);

    if (changes.length === 0) {
        return (
            <div className="container mx-auto">
                <div className="text-center text-2xl text-gray-600">
                    Brak zmian do wyświetlenia
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <div className="space-y-6">
                {/* Grupuj zmiany po rolach */}
                {Object.entries(
                    changes.reduce((acc, change) => {
                        if (!acc[change.roleName]) {
                            acc[change.roleName] = [];
                        }
                        acc[change.roleName].push(change);
                        return acc;
                    }, {} as Record<string, Change[]>)
                )
                .sort(([roleNameA], [roleNameB]) => {
                    // Mod Settings na samej górze
                    if (roleNameA === 'Mod Settings') return -1;
                    if (roleNameB === 'Mod Settings') return 1;
                    
                    // Impostor Settings na drugiej pozycji
                    if (roleNameA === 'Impostor Settings') return -1;
                    if (roleNameB === 'Impostor Settings') return 1;
                    
                    // Sprawdź czy to są role czy modyfikatory
                    const roleA = Roles.find(r => r.name === roleNameA);
                    const roleB = Roles.find(r => r.name === roleNameB);
                    const isModifierA = Modifiers.some(m => m.name === roleNameA);
                    const isModifierB = Modifiers.some(m => m.name === roleNameB);
                    
                    // Role przed modyfikatorami
                    if (roleA && isModifierB) return -1;
                    if (isModifierA && roleB) return 1;
                    
                    // Global Settings na końcu
                    if (roleNameA === 'Global Settings') return 1;
                    if (roleNameB === 'Global Settings') return -1;
                    
                    // Jeśli oba są rolami, sortuj według drużyn
                    if (roleA && roleB) {
                        const teamOrder = {
                            [Teams.Crewmate]: 1,
                            [Teams.Neutral]: 2,
                            [Teams.Impostor]: 3,
                            [Teams.All]: 4  // dla modyfikatorów, ale tu nie będzie używane
                        };
                        
                        const teamOrderA = teamOrder[roleA.team] || 999;
                        const teamOrderB = teamOrder[roleB.team] || 999;
                        
                        if (teamOrderA !== teamOrderB) {
                            return teamOrderA - teamOrderB;
                        }
                        
                        // W ramach tej samej drużyny sortuj alfabetycznie
                        return roleNameA.localeCompare(roleNameB);
                    }
                    
                    // W ramach modyfikatorów sortuj alfabetycznie
                    return roleNameA.localeCompare(roleNameB);
                })
                .map(([roleName, roleChanges]) => {
                    const roleInfo = getRoleInfo(roleName);
                    
                    // Specjalne ustawienia z dopasowanym stylem do reszty changeloga
                    if (roleName === 'Mod Settings') {
                        return (
                            <div key={roleName} className="bg-zinc-900/50 rounded-xl text-white p-6">
                                <div className="flex items-center gap-6">
                                    <div className="flex-shrink-0 w-[80px] h-[80px] flex items-center justify-center">
                                        <span className="text-6xl">⚙️</span>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="font-brook text-4xl mb-4 text-white">
                                            Mod Settings
                                        </h2>
                                        <ul className="space-y-2">
                                            {roleChanges.map((change, index) => (
                                                <li key={index} className="text-xl">
                                                    <span className="font-semibold">{change.settingName}:</span>{' '}
                                                    <span className="text-red-600">{change.oldValue}</span>{' '}
                                                    →{' '}
                                                    <span className="text-green-600">{change.newValue}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    
                    if (roleName === 'Impostor Settings') {
                        return (
                            <div key={roleName} className="bg-zinc-900/50 rounded-xl text-white p-6">
                                <div className="flex items-center gap-6">
                                    <div className="flex-shrink-0 w-[80px] h-[80px] flex items-center justify-center">
                                        <span className="text-6xl">🔪</span>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="font-brook text-4xl mb-4 text-white">
                                            Impostor Settings
                                        </h2>
                                        <ul className="space-y-2">
                                            {roleChanges.map((change, index) => (
                                                <li key={index} className="text-xl">
                                                    <span className="font-semibold">{change.settingName}:</span>{' '}
                                                    <span className="text-red-600">{change.oldValue}</span>{' '}
                                                    →{' '}
                                                    <span className="text-green-600">{change.newValue}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    
                    // Standardowy styl dla ról i modyfikatorów
                    return (
                        <div key={roleName} className="bg-zinc-900/50 rounded-xl text-white p-6">
                            <div className="flex items-center gap-6">
                                {roleInfo.icon && (
                                    <Image 
                                        src={roleInfo.icon} 
                                        alt={roleName}
                                        width={80}
                                        height={80}
                                        unoptimized
                                        quality={100}
                                        className="rounded-lg flex-shrink-0 scale-[1.9]"
                                        style={{ width: '80px', height: '80px' }}
                                    />
                                )}
                                <div className="flex-1">
                                    <h2 
                                        className="font-brook text-4xl mb-4"
                                        style={{ color: roleInfo.color }}
                                    >
                                        {roleName}
                                    </h2>
                                    <ul className="space-y-2">
                                        {roleChanges.map((change, index) => (
                                            <li key={index} className="text-xl">
                                                <span className="font-semibold">{change.settingName}:</span>{' '}
                                                <span className="text-red-600">{change.oldValue}</span>{' '}
                                                →{' '}
                                                <span className="text-green-600">{change.newValue}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}
