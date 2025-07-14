import { convertGameDataToUI, UIGameData, GameSummary } from './converter';
import { availableGames } from './games-list';

export type { GameSummary, UIGameData } from './converter';

export async function getGamesList(): Promise<GameSummary[]> {
    const games: GameSummary[] = [];
    
    for (const gameInfo of availableGames) {
        try {
            const gameModule = await import(`./${gameInfo.fileName}`);
            const originalData = gameModule.gameData;
            const convertedData = convertGameDataToUI(originalData, gameInfo.id);
            
            games.push({
                id: convertedData.id,
                date: convertedData.date,
                duration: convertedData.duration,
                players: convertedData.players,
                winner: convertedData.winner,
                winnerColor: convertedData.winnerColor,
                winCondition: convertedData.winCondition,
                map: convertedData.map,
                winnerNames: convertedData.winnerNames,
                winnerColors: convertedData.winnerColors,
                allPlayerNames: convertedData.detailedStats.playersData.map(p => p.nickname)
            });
        } catch (error) {
            console.error(`Błąd ładowania gry ${gameInfo.id}:`, error);
        }
    }
    
    // Sortuj gry od najmłodszej do najstarszej (odwrotnie alfabetycznie po ID)
    return games.sort((a, b) => b.id.localeCompare(a.id));
}

export async function getGameData(gameId: string): Promise<UIGameData | null> {
    try {
        const gameInfo = availableGames.find(g => g.id === gameId);
        if (!gameInfo) {
            console.error(`Nie znaleziono gry o ID: ${gameId}`);
            return null;
        }
        
        const gameModule = await import(`./${gameInfo.fileName}`);
        const originalData = gameModule.gameData;
        const convertedData = convertGameDataToUI(originalData, gameId);
        
        return convertedData;
    } catch (error) {
        console.error(`Nie znaleziono danych dla gry ${gameId}:`, error);
        return null;
    }
}

// Dodana funkcja do pobierania wszystkich gier dla statystyk
export async function getAllGamesData(): Promise<UIGameData[]> {
    const games: UIGameData[] = [];
    
    for (const gameInfo of availableGames) {
        try {
            const gameModule = await import(`./${gameInfo.fileName}`);
            const originalData = gameModule.gameData;
            const convertedData = convertGameDataToUI(originalData, gameInfo.id);
            games.push(convertedData);
        } catch (error) {
            console.error(`Błąd ładowania gry ${gameInfo.id}:`, error);
        }
    }
    
    // Sortuj gry od najmłodszej do najstarszej (odwrotnie alfabetycznie po ID)
    return games.sort((a, b) => b.id.localeCompare(a.id));
}

// Interface dla daty z grami
export interface DateWithGames {
    date: string; // format YYYYMMDD
    displayDate: string; // format wyświetlany użytkownikowi
    games: GameSummary[];
    totalGames: number;
}

// Funkcja do wyciągania daty z ID gry
export function extractDateFromGameId(gameId: string): string {
    // Format ID: 20250702_2156 -> zwraca: 20250702
    return gameId.split('_')[0];
}

// Funkcja do formatowania daty dla użytkownika
export function formatDisplayDate(dateString: string): string {
    // Format: 20250702 -> "2 lipca 2025"
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    
    const months = [
        '', 'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
        'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
    ];
    
    return `${parseInt(day)} ${months[parseInt(month)]} ${year}`;
}

// Funkcja do pobierania listy dat z grami
export async function getGameDatesList(): Promise<DateWithGames[]> {
    const games = await getGamesList();
    const dateGroups = new Map<string, GameSummary[]>();
    
    // Grupuj gry według dat
    games.forEach(game => {
        const date = extractDateFromGameId(game.id);
        if (!dateGroups.has(date)) {
            dateGroups.set(date, []);
        }
        dateGroups.get(date)!.push(game);
    });
    
    // Konwertuj na tablicę i sortuj od najnowszej daty
    const datesWithGames: DateWithGames[] = Array.from(dateGroups.entries()).map(([date, games]) => ({
        date,
        displayDate: formatDisplayDate(date),
        games: games.sort((a, b) => b.id.localeCompare(a.id)), // Sortuj gry od najnowszej
        totalGames: games.length
    }));
    
    return datesWithGames.sort((a, b) => b.date.localeCompare(a.date)); // Sortuj daty od najnowszej
}

// Funkcja do pobierania gier z konkretnej daty
export async function getGamesListByDate(date: string): Promise<GameSummary[]> {
    const games = await getGamesList();
    return games
        .filter(game => extractDateFromGameId(game.id) === date)
        .sort((a, b) => b.id.localeCompare(a.id)); // Sortuj od najnowszej
}
