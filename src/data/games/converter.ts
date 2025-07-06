// Importy dla oryginalnych interfejsów
export type { GameMetadata, PlayerStats, GameEvent, MeetingData, GameData } from './game_data_20250702_2156';
import type { PlayerStats, GameData, GameEvent, MeetingData } from './game_data_20250702_2156';
import { Roles } from '@/roles';
import { Modifiers } from '@/modifiers';
import { Teams } from '@/constants/teams';

// Nowe interfejsy dla UI (zachowuję kompatybilność z obecnym kodem)
export interface GameSummary {
    id: string;
    date: string;
    duration: string;
    players: number;
    winner: string;
    winnerColor?: string; // Kolor zwycięzcy (dla neutralnych ról)
    winCondition: string;
    map: string;
    winnerNames: string[];
    winnerColors: Record<string, string>; // Mapowanie nicków zwycięzców na kolory ich ról
    allPlayerNames: string[]; // Lista wszystkich graczy w grze
}

export interface UIGameData {
    id: string;
    date: string;
    duration: string;
    players: number;
    winner: string;
    winnerColor?: string; // Kolor zwycięzcy (dla neutralnych ról)
    winCondition: string;
    map: string;
    winnerNames: string[];
    winnerColors: Record<string, string>; // Mapowanie nicków zwycięzców na kolory ich ról
    maxTasks?: number; // Maksymalna liczba zadań z metadanych gry
    detailedStats: {
        playersData: UIPlayerData[];
        events: UIGameEvent[];
        meetings: UIMeetingData[];
        gameSettings?: Record<string, unknown> | null; // Opcjonalne, jeśli nie masz ustawień w danych
    };
}

export interface UIPlayerData {
    nickname: string;
    role: string;
    roleColor: string; // Dodane - kolor roli z definicji
    roleHistory?: string[];
    modifiers: string[];
    modifierColors: string[]; // Dodane - kolory modyfikatorów
    team: string;
    survived: boolean;
    tasksCompleted: number;
    totalTasks?: number;
    kills: number;
    deaths: number;
    meetings?: number;
    totalPoints: number;
    win: boolean;
    originalStats: PlayerStats; // Dodane - oryginalne statystyki
}

export interface UIGameEvent {
    timestamp: string;
    type: 'kill' | 'meeting' | 'vote' | 'task' | 'sabotage' | 'fix' | 'vent' | 'other';
    player: string;
    target?: string;
    description: string;
}

export interface UIMeetingData {
    meetingNumber: number;
    deathsSinceLastMeeting: string[];
    votes: { [playerName: string]: string[] };
    skipVotes: string[];
    noVotes: string[];
    wasTie: boolean;
    wasBlessed: boolean;
}

// Interface for ranking statistics
export interface PlayerRankingStats {
    name: string;
    gamesPlayed: number;
    wins: number;
    winRate: number;
}

// Funkcje konwersji
export function determineWinner(players: PlayerStats[]): { winner: string; winnerColor?: string; winnerNames: string[]; winnerColors: Record<string, string>; winCondition: string } {
    const winners = players.filter(p => p.win > 0);
    
    if (winners.length === 0) {
        return {
            winner: "Nieznany",
            winnerNames: [],
            winnerColors: {},
            winCondition: "Gra nie została ukończona"
        };
    }

    // Wszystkie nazwy zwycięzców (niezależnie od drużyny)
    const allWinnerNames = winners.map(w => w.playerName);
    
    // Mapowanie nicków na kolory ról
    const winnerColors: Record<string, string> = {};
    winners.forEach(winner => {
        const lastRole = winner.roleHistory[winner.roleHistory.length - 1];
        const roleColor = getRoleColor(lastRole);
        winnerColors[winner.playerName] = roleColor;
    });

    // SPECJALNY PRZYPADEK: Sprawdź czy wszyscy zwycięzcy mają modyfikator "Lover"
    const allHaveLoverModifier = winners.length > 1 && winners.every(winner => 
        winner.modifiers.some((modifier: string) => modifier.toLowerCase() === 'lover')
    );
    
    if (allHaveLoverModifier) {
        // Wszyscy zwycięzcy to Lovers - zalicz jako Neutral z różowym kolorem
        const loverColor = "#FF69B4"; // Kolor Lovers
        // Zachowaj oryginalne kolory ról dla nicków
        
        return {
            winner: "Lovers",
            winnerColor: loverColor,
            winnerNames: allWinnerNames,
            winnerColors: winnerColors, // Zachowaj oryginalne kolory ról
            winCondition: "Lovers wygrali"
        };
    }

    // PRIORYTET 1: Sprawdź czy są Impostorzy (najwyższy priorytet)
    const impostorWinners = winners.filter(w => {
        const lastRole = w.roleHistory[w.roleHistory.length - 1];
        const roleDefinition = Roles.find(role => {
            const normalizedRoleName = role.name.toLowerCase().replace(/\s+/g, '');
            const normalizedLastRole = lastRole.toLowerCase().replace(/\s+/g, '');
            return normalizedRoleName === normalizedLastRole;
        });
        return roleDefinition && roleDefinition.team === Teams.Impostor;
    });
    
    if (impostorWinners.length > 0) {
        return {
            winner: "Impostor",
            winnerNames: allWinnerNames,
            winnerColors: winnerColors,
            winCondition: "Impostor wygrał"
        };
    }

    // PRIORYTET 2: Sprawdź czy są Crewmates (średni priorytet)
    const crewmateWinners = winners.filter(w => {
        const lastRole = w.roleHistory[w.roleHistory.length - 1];
        const roleDefinition = Roles.find(role => {
            const normalizedRoleName = role.name.toLowerCase().replace(/\s+/g, '');
            const normalizedLastRole = lastRole.toLowerCase().replace(/\s+/g, '');
            return normalizedRoleName === normalizedLastRole;
        });
        return roleDefinition && roleDefinition.team === Teams.Crewmate;
    });
    
    if (crewmateWinners.length > 0) {
        return {
            winner: "Crewmate",
            winnerNames: allWinnerNames,
            winnerColors: winnerColors,
            winCondition: "Crewmate wygrał"
        };
    }

    // PRIORYTET 3: Sprawdź czy są role neutralne (najniższy priorytet)
    const neutralWinners = winners.filter(w => {
        const lastRole = w.roleHistory[w.roleHistory.length - 1];
        const roleDefinition = Roles.find(role => {
            const normalizedRoleName = role.name.toLowerCase().replace(/\s+/g, '');
            const normalizedLastRole = lastRole.toLowerCase().replace(/\s+/g, '');
            return normalizedRoleName === normalizedLastRole;
        });
        return roleDefinition && roleDefinition.team === Teams.Neutral;
    });
    
    if (neutralWinners.length > 0) {
        const firstWinner = neutralWinners[0];
        const lastRole = firstWinner.roleHistory[firstWinner.roleHistory.length - 1];
        const normalizedRoleName = normalizeRoleName(lastRole);
        const roleColor = getRoleColor(lastRole);
        
        return {
            winner: normalizedRoleName,
            winnerColor: roleColor,
            winnerNames: allWinnerNames,
            winnerColors: winnerColors,
            winCondition: `${normalizedRoleName} wygrał`
        };
    }

    // Fallback - jeśli nie udało się zidentyfikować żadnej drużyny
    return {
        winner: "Nieznany",
        winnerNames: allWinnerNames,
        winnerColors: winnerColors,
        winCondition: "Nieznany zwycięzca"
    };
}

export function determineTeam(roleHistory: string[]): string {
    // Sprawdź ostatnią rolę (najważniejszą)
    const lastRole = roleHistory[roleHistory.length - 1];
    
    // Specjalne przypadki dla podstawowych ról
    if (lastRole.toLowerCase() === 'crewmate') {
        return "Crewmate";
    }
    if (lastRole.toLowerCase() === 'impostor') {
        return "Impostor";
    }
    
    // Specjalne przypadki dla pojedynczych form ról złożonych
    if (lastRole.toLowerCase() === 'plaguebearer' || lastRole.toLowerCase() === 'pestilence') {
        return "Neutral"; // Plaguebearer/Pestilence to Neutral
    }
    if (lastRole.toLowerCase() === 'politician' || lastRole.toLowerCase() === 'mayor') {
        return "Crewmate"; // Politician/Mayor to Crewmate
    }
    
    // Znajdź definicję roli w systemie - tylko dokładne dopasowania
    const roleDefinition = Roles.find(role => {
        const normalizedRoleName = role.name.toLowerCase().replace(/\s+/g, '').replace(/[\/]/g, '');
        const normalizedLastRole = lastRole.toLowerCase().replace(/\s+/g, '');
        
        // TYLKO dokładne dopasowanie - usunięte dopasowania częściowe
        return normalizedRoleName === normalizedLastRole;
    });
    
    if (roleDefinition) {
        switch (roleDefinition.team) {
            case Teams.Crewmate:
                return "Crewmate";
            case Teams.Impostor:
                return "Impostor";
            case Teams.Neutral:
                return "Neutral";
            default:
                return "Unknown";
        }
    }
    
    // Fallback jeśli nie znaleziono roli
    console.warn(`Nie znaleziono definicji dla roli: ${lastRole}`);
    return "Unknown";
}

export function categorizeEvent(description: string): 'kill' | 'meeting' | 'vote' | 'task' | 'sabotage' | 'fix' | 'vent' | 'other' {
    if (description.includes('killed')) return 'kill';
    if (description.includes('reported') || description.includes('Meeting started')) return 'meeting';
    if (description.includes('exiled') || description.includes('voted')) return 'vote';
    if (description.includes('task')) return 'task';
    if (description.includes('sabotage')) return 'sabotage';
    if (description.includes('fix')) return 'fix';
    if (description.includes('vent')) return 'vent';
    return 'other';
}

export function extractPlayerFromDescription(description: string): string {
    // Próbuj wyciągnąć pierwszego gracza z opisu
    const match = description.match(/^([^(]+)/);
    return match ? match[1].trim() : '';
}

export function extractTargetFromDescription(description: string): string | undefined {
    // Szukaj wzorca "killed X" lub podobnego
    const killMatch = description.match(/killed ([^(]+)/);
    if (killMatch) return killMatch[1].trim();
    
    const reportMatch = description.match(/reported ([^']+)'s/);
    if (reportMatch) return reportMatch[1].trim();
    
    return undefined;
}

// Funkcja główna konwersji
export function convertGameDataToUI(originalData: GameData, gameId: string): UIGameData {
    const { winner, winnerColor, winnerNames, winnerColors, winCondition } = determineWinner(originalData.players);
    
    return {
        id: gameId,
        date: originalData.metadata.startTime,
        duration: originalData.metadata.duration,
        players: originalData.metadata.playerCount,
        winner,
        winnerColor,
        winCondition,
        map: originalData.metadata.map,
        winnerNames,
        winnerColors,
        maxTasks: originalData.metadata.maxTasks, // Przekaż maxTasks z metadanych
        detailedStats: {
            playersData: originalData.players.map((player: PlayerStats) => convertPlayerData(player)),
            events: originalData.gameEvents.map((event: GameEvent) => convertGameEvent(event)),
            meetings: originalData.meetings.map((meeting: MeetingData) => convertMeetingData(meeting)),
            gameSettings: null // Brak ustawień w oryginalnych danych
        }
    };
}

export function convertPlayerData(player: PlayerStats): UIPlayerData {
    // Konwertuj nazwy ról na format z odstępami i pobierz kolor
    const normalizedRoles = player.roleHistory.map((role: string) => normalizeRoleName(role));
    const lastRole = player.roleHistory[player.roleHistory.length - 1];
    const roleColor = getRoleColor(lastRole);
    
    // Pobierz kolory modyfikatorów
    const modifierColors = player.modifiers.map((modifier: string) => getModifierColor(modifier));
    
    return {
        nickname: player.playerName,
        role: normalizedRoles[normalizedRoles.length - 1], // Ostatnia rola
        roleColor: roleColor,
        roleHistory: normalizedRoles,
        modifiers: player.modifiers,
        modifierColors: modifierColors,
        team: determineTeam(player.roleHistory),
        survived: player.win > 0, // Jeśli wygrał, prawdopodobnie przeżył
        tasksCompleted: player.completedTasks,
        totalTasks: undefined, // Nie mamy tej informacji w oryginalnych danych
        kills: player.correctKills,
        deaths: player.win > 0 ? 0 : 1, // Założenie: jeśli nie wygrał, prawdopodobnie zmarł
        meetings: 0, // Brak tej informacji w danych
        totalPoints: player.totalPoints,
        win: player.win > 0,
        originalStats: player // Dodane - oryginalne statystyki
    };
}

// Funkcja pomocnicza do normalizacji nazw ról
export function normalizeRoleName(roleName: string): string {
    // Specjalne przypadki dla podstawowych ról
    if (roleName.toLowerCase() === 'crewmate') {
        return 'Crewmate';
    }
    if (roleName.toLowerCase() === 'impostor') {
        return 'Impostor';
    }
    
    // Specjalne przypadki dla pojedynczych form ról złożonych - zwróć jako osobne role
    if (roleName.toLowerCase() === 'plaguebearer') {
        return 'Plaguebearer';
    }
    if (roleName.toLowerCase() === 'pestilence') {
        return 'Pestilence';
    }
    if (roleName.toLowerCase() === 'politician') {
        return 'Politician';
    }
    if (roleName.toLowerCase() === 'mayor') {
        return 'Mayor';
    }
    
    // Znajdź definicję roli w systemie - tylko dla dokładnych dopasowań
    const roleDefinition = Roles.find(role => {
        const normalizedSystemRole = role.name.toLowerCase().replace(/\s+/g, '').replace(/[\/]/g, '');
        const normalizedInputRole = roleName.toLowerCase().replace(/\s+/g, '');
        
        // TYLKO dokładne dopasowanie - usunięte dopasowania częściowe
        return normalizedSystemRole === normalizedInputRole;
    });
    
    // Jeśli znaleziono definicję, użyj jej nazwy (z odstępami)
    if (roleDefinition) {
        return roleDefinition.name;
    }
    
    // Fallback - dodaj odstępy ręcznie dla znanych przypadków
    const roleNameMappings: Record<string, string> = {
        'GuardianAngel': 'Guardian Angel',
        'SoulCollector': 'Soul Collector',
        // Dodaj więcej mappingów jeśli potrzeba
    };
    
    return roleNameMappings[roleName] || roleName;
}

// Funkcja pomocnicza do pobierania koloru roli
export function getRoleColor(roleName: string): string {
    // Specjalne przypadki dla podstawowych ról
    if (roleName.toLowerCase() === 'crewmate') {
        return "#00FFFF"; // Kolor drużyny Crewmate
    }
    if (roleName.toLowerCase() === 'impostor') {
        return "#FF0000"; // Kolor drużyny Impostor
    }
    
    // Specjalne przypadki dla pojedynczych form ról złożonych - własne kolory
    if (roleName.toLowerCase() === 'plaguebearer') {
        return "#E6FFB3"; // Kolor z definicji Plaguebearer / Pestilence
    }
    if (roleName.toLowerCase() === 'pestilence') {
        return "#E6FFB3"; // Ten sam kolor co Plaguebearer (ta sama rola w różnych fazach)
    }
    if (roleName.toLowerCase() === 'politician') {
        return "#660099"; // Kolor z definicji Politician / Mayor
    }
    if (roleName.toLowerCase() === 'mayor') {
        return "#660099"; // Ten sam kolor co Politician (ta sama rola w różnych fazach)
    }
    
    // Znajdź definicję roli w systemie - tylko dla dokładnych dopasowań
    const roleDefinition = Roles.find(role => {
        const normalizedSystemRole = role.name.toLowerCase().replace(/\s+/g, '').replace(/[\/]/g, '');
        const normalizedInputRole = roleName.toLowerCase().replace(/\s+/g, '');
        
        // TYLKO dokładne dopasowanie - usunięte dopasowania częściowe
        return normalizedSystemRole === normalizedInputRole;
    });
    
    // Jeśli znaleziono definicję, użyj jej koloru
    if (roleDefinition) {
        return roleDefinition.color;
    }
    
    // Fallback - zwróć neutralny kolor
    return "#808080"; // Szary kolor dla nieznanych ról
}

// Funkcja pomocnicza do pobierania koloru modyfikatora
export function getModifierColor(modifierName: string): string {
    // Znajdź definicję modyfikatora w systemie
    const modifierDefinition = Modifiers.find(modifier => {
        const normalizedSystemModifier = modifier.name.toLowerCase().replace(/\s+/g, '');
        const normalizedInputModifier = modifierName.toLowerCase().replace(/\s+/g, '');
        return normalizedSystemModifier === normalizedInputModifier;
    });
    
    // Jeśli znaleziono definicję, użyj jej koloru
    if (modifierDefinition) {
        return modifierDefinition.color;
    }
    
    // Specjalne mapowania dla znanych przypadków
    const modifierNameMappings: Record<string, string> = {
        'Lover': 'Lovers', // "Lover" w danych to "Lovers" w systemie
        'Sixth Sense': 'Sixth Sense',
        'Button Barry': 'Button Barry',
        // Dodaj więcej mappingów jeśli potrzeba
    };
    
    // Sprawdź mapowanie
    const mappedName = modifierNameMappings[modifierName];
    if (mappedName) {
        const mappedDefinition = Modifiers.find(modifier => modifier.name === mappedName);
        if (mappedDefinition) {
            return mappedDefinition.color;
        }
    }
    
    // Fallback - zwróć szary kolor dla nieznanych modyfikatorów
    return "#808080"; // Szary kolor dla nieznanych modyfikatorów
}

export function convertGameEvent(event: GameEvent): UIGameEvent {
    return {
        timestamp: event.timestamp,
        type: categorizeEvent(event.description),
        player: extractPlayerFromDescription(event.description),
        target: extractTargetFromDescription(event.description),
        description: event.description
    };
}

export function convertMeetingData(meeting: MeetingData): UIMeetingData {
    return {
        meetingNumber: meeting.meetingNumber,
        deathsSinceLastMeeting: meeting.deathsSinceLastMeeting,
        votes: meeting.votes,
        skipVotes: meeting.skipVotes,
        noVotes: meeting.noVotes,
        wasTie: meeting.wasTie,
        wasBlessed: meeting.wasBlessed
    };
}

// Funkcja pomocnicza do formatowania statystyk gracza z kolorami
export function formatPlayerStatsWithColors(player: UIPlayerData, maxTasks?: number): Array<{ text: string; color?: string }> {
    const stats = player.originalStats;
    const statParts: Array<{ text: string; color?: string }> = [];
    
    // Mapowanie nazw statystyk na angielskie nazwy z kolorami
    const statLabels: Record<string, { label: string; color?: string }> = {
        'correctKills': { label: 'Correct Kills', color: '#22C55E' }, // zielony
        'incorrectKills': { label: 'Incorrect Kills', color: '#EF4444' }, // czerwony
        'correctProsecutes': { label: 'Correct Prosecutes', color: '#22C55E' },
        'incorrectProsecutes': { label: 'Incorrect Prosecutes', color: '#EF4444' },
        'correctGuesses': { label: 'Correct Guesses', color: '#22C55E' },
        'incorrectGuesses': { label: 'Incorrect Guesses', color: '#EF4444' },
        'correctDeputyShoots': { label: 'Correct Deputy Shoots', color: '#22C55E' },
        'incorrectDeputyShoots': { label: 'Incorrect Deputy Shoots', color: '#EF4444' },
        'correctJailorExecutes': { label: 'Correct Jailor Executes', color: '#22C55E' },
        'incorrectJailorExecutes': { label: 'Incorrect Jailor Executes', color: '#EF4444' },
        'correctMedicShields': { label: 'Correct Medic Shields', color: '#22C55E' },
        'incorrectMedicShields': { label: 'Incorrect Medic Shields', color: '#EF4444' },
        'correctWardenFortifies': { label: 'Correct Warden Fortifies', color: '#22C55E' },
        'incorrectWardenFortifies': { label: 'Incorrect Warden Fortifies', color: '#EF4444' },
        'janitorCleans': { label: 'Janitor Cleans' },
        'correctAltruistRevives': { label: 'Correct Altruist Revives', color: '#22C55E' },
        'incorrectAltruistRevives': { label: 'Incorrect Altruist Revives', color: '#EF4444' },
        'correctSwaps': { label: 'Correct Swaps', color: '#22C55E' },
        'incorrectSwaps': { label: 'Incorrect Swaps', color: '#EF4444' }
        // Usunięto: 'initialRolePoints' i 'totalPoints'
    };
    
    // Iteruj przez wszystkie statystyki i dodaj te które nie są zerem
    Object.entries(stats).forEach(([key, value]) => {
        if (typeof value === 'number' && value > 0 && statLabels[key]) {
            const config = statLabels[key];
            statParts.push({
                text: `${config.label}: ${value}`,
                color: config.color
            });
        }
    });
    
    // Obsługa completed tasks - nie wyświetlaj jeśli 0 zrobionych
    if (stats.completedTasks > 0) {
        const tasksText = maxTasks !== undefined 
            ? `Completed Tasks: ${stats.completedTasks}/${maxTasks}`
            : `Completed Tasks: ${stats.completedTasks}`;
        statParts.push({
            text: tasksText,
            color: undefined // Bez specjalnego koloru
        });
    }
    
    // Dodaj specjalne informacje
    if (stats.win > 0) {
        statParts.push({ text: '🏆 Winner', color: '#FFD700' }); // złoty
    }
    
    return statParts;
}

// Funkcja pomocnicza do formatowania statystyk gracza
export function formatPlayerStats(player: UIPlayerData, maxTasks?: number): string {
    const parts = formatPlayerStatsWithColors(player, maxTasks);
    return parts.map(part => part.text).join(' • ');
}

// Funkcja do generowania statystyk rankingu dla wszystkich graczy
export function generatePlayerRankingStats(allGames: UIGameData[]): PlayerRankingStats[] {
    const playerStats = new Map<string, { played: number; won: number }>();
    
    // Przeiteruj przez wszystkie gry i zlicz statystyki
    allGames.forEach(game => {
        game.detailedStats.playersData.forEach(player => {
            const playerName = player.nickname;
            
            if (!playerStats.has(playerName)) {
                playerStats.set(playerName, { played: 0, won: 0 });
            }
            
            const stats = playerStats.get(playerName)!;
            stats.played += 1;
            
            if (player.win) {
                stats.won += 1;
            }
        });
    });
    
    // Konwertuj na tablicę z obliczonym procentem wygranych
    const rankingStats: PlayerRankingStats[] = Array.from(playerStats.entries()).map(([playerName, stats]) => ({
        name: playerName,
        gamesPlayed: stats.played,
        wins: stats.won,
        winRate: stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0
    }));
    
    // Sortuj według win rate (malejąco), a następnie według liczby gier (malejąco)
    rankingStats.sort((a, b) => {
        if (b.winRate !== a.winRate) {
            return b.winRate - a.winRate;
        }
        return b.gamesPlayed - a.gamesPlayed;
    });
    
    return rankingStats;
}
