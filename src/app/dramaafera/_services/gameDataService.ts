import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../api/_database';
import { withoutDeleted } from '../../api/schema/common';
import { Roles } from '@/roles';
import { Modifiers } from '@/modifiers';
import { Teams } from '@/constants/teams';
import type { Prisma } from '../../api/_database';
import type { GamePlayerStatistics, PlayerRole, PlayerModifier } from '@prisma/client';

// Type for game statistics with included relationships
type GamePlayerStatisticsWithRelations = GamePlayerStatistics & {
  roleHistory: PlayerRole[];
  modifiers: PlayerModifier[];
};

// Types that match the existing UI expectations
export interface GameSummary {
  id: string;
  date: string;
  gameNumber: number;
  duration: string;
  players: number;
  winner: string;
  winnerColor: string;
  winCondition: string;
  map: string;
  winnerNames: string[];
  winnerColors: Record<string, string>;
  allPlayerNames: string[];
}

export interface DateWithGames {
  date: string; // format YYYYMMDD
  displayDate: string; // format wyświetlany użytkownikowi
  games: GameSummary[];
  totalGames: number;
}

export interface PlayerStats {
  nickname: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPoints: number;
  averagePoints: number;
  roles: Record<string, number>;
  modifiers: Record<string, number>;
  favoriteRole: string;
  favoriteTeam: string;
  teamStats: {
    crewmate: { games: number; wins: number };
    impostor: { games: number; wins: number };
    neutral: { games: number; wins: number };
  };
}

// Interface for UI player data (compatible with existing components)
export interface UIPlayerData {
  nickname: string;
  role: string;
  roleColor: string;
  roleHistory?: string[];
  modifiers: string[];
  modifierColors: string[];
  team: string;
  survived: boolean;
  tasksCompleted: number;
  totalTasks?: number;
  kills: number;
  deaths: number;
  meetings?: number;
  totalPoints: number;
  win: boolean;
  correctKills: number;
  incorrectKills: number;
  correctProsecutes: number;
  incorrectProsecutes: number;
  correctGuesses: number;
  incorrectGuesses: number;
  correctDeputyShoots: number;
  incorrectDeputyShoots: number;
  correctJailorExecutes: number;
  incorrectJailorExecutes: number;
  correctMedicShields: number;
  incorrectMedicShields: number;
  correctWardenFortifies: number;
  incorrectWardenFortifies: number;
  janitorCleans: number;
  completedTasks: number;
  survivedRounds: number;
  correctAltruistRevives: number;
  incorrectAltruistRevives: number;
  correctSwaps: number;
  incorrectSwaps: number;
  originalStats: {
    playerName: string;
    roleHistory: string[];
    modifiers: string[];
    win: number;
    disconnected?: number;
    initialRolePoints: number;
    correctKills: number;
    incorrectKills: number;
    correctProsecutes: number;
    incorrectProsecutes: number;
    correctGuesses: number;
    incorrectGuesses: number;
    correctDeputyShoots: number;
    incorrectDeputyShoots: number;
    correctJailorExecutes: number;
    incorrectJailorExecutes: number;
    correctMedicShields: number;
    incorrectMedicShields: number;
    correctWardenFortifies: number;
    incorrectWardenFortifies: number;
    janitorCleans: number;
    completedTasks: number;
    survivedRounds?: number;
    correctAltruistRevives: number;
    incorrectAltruistRevives: number;
    correctSwaps: number;
    incorrectSwaps: number;
    totalPoints: number;
  };
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
  blackmailedPlayers?: string[];
  jailedPlayers?: string[];
  wasTie: boolean;
  wasBlessed: boolean;
}

// Interface for UI game data (compatible with existing components)
export interface UIGameData {
  id: string;
  date: string;
  gameNumber: number;
  startTime: string;
  endTime: string;
  duration: string;
  map: string;
  winner: string;
  winnerColor: string;
  winCondition: string;
  winnerNames: string[];
  winnerColors: Record<string, string>;
  players: number;
  maxTasks?: number;
  detailedStats: {
    playersData: UIPlayerData[];
    events: UIGameEvent[];
    meetings: UIMeetingData[];
    gameSettings?: Record<string, unknown> | null;
  };
}

// Interface for user profile statistics
export interface UserProfileStats {
    name: string;
    gamesPlayed: number;
    wins: number;
    winRate: number;
    impostorGames: number;
    crewmateGames: number;
    neutralGames: number;
    totalTasks: number;
    maxTasks: number;
    correctKills: number;
    incorrectKills: number;
    correctGuesses: number;
    incorrectGuesses: number;
    correctProsecutes: number;
    incorrectProsecutes: number;
    correctDeputyShoots: number;
    incorrectDeputyShoots: number;
    correctJailorExecutes: number;
    incorrectJailorExecutes: number;
    correctMedicShields: number;
    incorrectMedicShields: number;
    correctWardenFortifies: number;
    incorrectWardenFortifies: number;
    janitorCleans: number;
    survivedRounds: number;
    totalRounds: number;
    correctAltruistRevives: number;
    incorrectAltruistRevives: number;
    correctSwaps: number;
    incorrectSwaps: number;
}

// Type alias for backward compatibility
export type DetailedGameData = UIGameData;

// Helper function to get database client
async function getDatabaseClient() {
  try {
    const { env } = await getCloudflareContext();
    return getPrismaClient(env.DB);
  } catch (_error) {
    // During build time, Cloudflare context is not available
    // Return null to indicate database is not accessible
    return null;
  }
}

// Helper function to format duration
function formatDuration(startTime: Date, endTime: Date): string {
  const durationMs = endTime.getTime() - startTime.getTime();
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Helper function to determine team color
function getTeamColor(team: string): string {
  switch (team) {
    case 'Crewmate': return 'rgb(0, 255, 255)';
    case 'Impostor': return 'rgb(255, 0, 0)';
    case 'Neutral': return 'rgb(167, 167, 167)';
    default: return 'rgb(255, 255, 255)';
  }
}

// Helper function to convert database role names to display names
function convertRoleNameForDisplay(roleName: string): string {
  // Map database role names to display names - handle both formats
  const roleNameMapping: Record<string, string> = {
    'SoulCollector': 'Soul Collector',
    'Soul Collector': 'Soul Collector', // Already has space
    'GuardianAngel': 'Guardian Angel', 
    'Guardian Angel': 'Guardian Angel', // Already has space
    // Keep Plaguebearer and Pestilence as separate roles - they should show as is
  };
  
  return roleNameMapping[roleName] || roleName;
}

// Type for game statistics with minimal required properties
interface GameStatWithWin {
  win: boolean;
  modifiers?: Array<{
    modifierName: string;
  }>;
  roleHistory: Array<{
    roleName: string;
    order: number;
  }>;
}

// Dynamic winner calculation from database data (like old system)
function calculateWinnerFromStats(gameStats: GameStatWithWin[]): { winner: string; winnerColor: string; winCondition: string } {
  const winners = gameStats.filter(stat => stat.win);
  
  if (winners.length === 0) {
    return {
      winner: 'Unknown',
      winnerColor: '#808080',
      winCondition: 'No winner'
    };
  }

  // Check for Lovers special case first
  const allHaveLoverModifier = winners.length > 1 && winners.every(stat => 
    stat.modifiers && stat.modifiers.some((mod) => mod.modifierName.toLowerCase() === 'lover')
  );
  
  if (allHaveLoverModifier) {
    return {
      winner: 'Lovers',
      winnerColor: '#FF69B4',
      winCondition: 'Lovers won'
    };
  }

  // PRIORITY 1: Check for Impostors (highest priority)
  const impostorWinners = winners.filter(stat => {
    if (!stat.roleHistory || stat.roleHistory.length === 0) return false;
    const roleHistory = stat.roleHistory.sort((a, b) => a.order - b.order);
    const finalRole = roleHistory[roleHistory.length - 1]?.roleName || '';
    return determineTeam(finalRole) === Teams.Impostor;
  });
  
  if (impostorWinners.length > 0) {
    return {
      winner: 'Impostor',
      winnerColor: getTeamColor('Impostor'),
      winCondition: 'Impostor won'
    };
  }

  // PRIORITY 2: Check for Crewmates (medium priority)
  const crewmateWinners = winners.filter(stat => {
    if (!stat.roleHistory || stat.roleHistory.length === 0) return false;
    const roleHistory = stat.roleHistory.sort((a, b) => a.order - b.order);
    const finalRole = roleHistory[roleHistory.length - 1]?.roleName || '';
    return determineTeam(finalRole) === Teams.Crewmate;
  });
  
  if (crewmateWinners.length > 0) {
    return {
      winner: 'Crewmate',
      winnerColor: getTeamColor('Crewmate'),
      winCondition: 'Crewmate won'
    };
  }

  // PRIORITY 3: Check for Neutrals (lowest priority)
  const neutralWinners = winners.filter(stat => {
    if (!stat.roleHistory || stat.roleHistory.length === 0) return false;
    const roleHistory = stat.roleHistory.sort((a, b) => a.order - b.order);
    const finalRole = roleHistory[roleHistory.length - 1]?.roleName || '';
    return determineTeam(finalRole) === Teams.Neutral;
  });
  
  if (neutralWinners.length > 0) {
    // For neutrals, use the specific role name (like Vampire, Jester, etc.)
    const firstNeutral = neutralWinners[0];
    if (!firstNeutral.roleHistory || firstNeutral.roleHistory.length === 0) {
      return {
        winner: 'Neutral',
        winnerColor: getTeamColor('Neutral'),
        winCondition: 'Neutral won'
      };
    }
    const roleHistory = firstNeutral.roleHistory.sort((a, b) => a.order - b.order);
    const finalRole = roleHistory[roleHistory.length - 1]?.roleName || 'Neutral';
    
    // Convert database role names to display names
    const displayRoleName = convertRoleNameForDisplay(finalRole);
    const roleColor = getRoleColor(displayRoleName);
    
    return {
      winner: displayRoleName,
      winnerColor: roleColor,
      winCondition: `${displayRoleName} won`
    };
  }

  // Fallback
  return {
    winner: 'Unknown',
    winnerColor: '#808080',
    winCondition: 'Unknown winner'
  };
}

// Helper function to format date for display
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

// Helper function to extract date from game identifier
export function extractDateFromGameId(gameId: string): string {
  // Format ID: 20250702_2156 -> zwraca: 20250702
  return gameId.split('_')[0];
}

// Helper function to get role color
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

  // Convert database role names to display names before lookup
  const displayRoleName = convertRoleNameForDisplay(roleName);

  // Znajdź rolę w definicjach
  const role = Roles.find(r => 
    r.name.toLowerCase() === displayRoleName.toLowerCase() || 
    r.id.toLowerCase() === roleName.toLowerCase() ||
    r.name.toLowerCase() === roleName.toLowerCase()
  );
  
  if (role) {
    return role.color;
  }

  // Fallback - zwróć kolor drużyny na podstawie nazwy roli
  const impostorRoles = ['shapeshifter', 'morphling', 'swooper', 'glitch', 'venerer'];
  const neutralRoles = ['jester', 'executioner', 'arsonist', 'plaguebearer', 'doomsayer', 'amnesiac'];
  
  if (impostorRoles.includes(roleName.toLowerCase())) {
    return "#FF0000";
  } else if (neutralRoles.includes(roleName.toLowerCase())) {
    return "#A7A7A7";
  } else {
    return "#00FFFF";
  }
}

// Helper function to get modifier color
export function getModifierColor(modifierName: string): string {
  const modifier = Modifiers.find(m => 
    m.name.toLowerCase() === modifierName.toLowerCase() || 
    m.id.toLowerCase() === modifierName.toLowerCase()
  );
  
  if (modifier) {
    return modifier.color;
  }
  
  // Fallback color for unknown modifiers
  return "#FFFFFF";
}

// Helper function to normalize role name
export function normalizeRoleName(roleName: string): string {
  const role = Roles.find(r => 
    r.id.toLowerCase() === roleName.toLowerCase() ||
    r.name.toLowerCase() === roleName.toLowerCase()
  );
  
  if (role) {
    return role.name;
  }
  
  // Fallback - capitalize first letter
  return roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();
}

// Helper function to determine team from role
export function determineTeam(roleName: string | string[]): string {
  // Handle array input - use last role (final role) like old system
  const roleToCheck = Array.isArray(roleName) ? roleName[roleName.length - 1] : roleName;
  
  // Specjalne przypadki dla pojedynczych form ról złożonych
  if (roleToCheck.toLowerCase() === 'plaguebearer' || roleToCheck.toLowerCase() === 'pestilence') {
    return Teams.Neutral; // Plaguebearer/Pestilence to Neutral
  }
  
  // Convert database role names to proper display names before lookup
  const displayRoleName = convertRoleNameForDisplay(roleToCheck);
  
  const role = Roles.find(r => 
    r.name.toLowerCase() === displayRoleName.toLowerCase() || 
    r.id.toLowerCase() === roleToCheck.toLowerCase() ||
    r.name.toLowerCase() === roleToCheck.toLowerCase()
  );
  
  if (role) {
    return role.team;
  }

  // Fallback logic
  const impostorRoles = ['impostor', 'shapeshifter', 'morphling', 'swooper', 'glitch', 'venerer'];
  const neutralRoles = ['jester', 'executioner', 'arsonist', 'plaguebearer', 'doomsayer', 'amnesiac'];
  
  if (impostorRoles.includes(roleToCheck.toLowerCase())) {
    return Teams.Impostor;
  } else if (neutralRoles.includes(roleToCheck.toLowerCase())) {
    return Teams.Neutral;
  } else {
    return Teams.Crewmate;
  }
}

// Helper function to format player stats with colors
export function formatPlayerStatsWithColors(player: UIPlayerData, maxTasks?: number): Array<{ text: string; color?: string }> {
  const statParts: Array<{ text: string; color?: string }> = [];
  
  // Mapowanie nazw statystyk na angielskie nazwy z kolorami (identyczne z /dramaafera/)
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
  };

  // Iteruj przez wszystkie statystyki i dodaj te które nie są zerem (identycznie z /dramaafera/)
  const stats = player.originalStats;
  Object.entries(stats).forEach(([key, value]) => {
    if (typeof value === 'number' && value > 0 && statLabels[key]) {
      const config = statLabels[key];
      statParts.push({
        text: `${config.label}: ${value}`,
        color: config.color
      });
    }
  });

  // Obsługa completed tasks
  // Wyświetl dla Crewmate bez modyfikatora Lovers nawet jeśli 0 tasków
  const isCrewmate = player.team === 'Crewmate';
  const hasLovers = player.modifiers.some(mod => mod.toLowerCase().includes('lover'));
  const shouldShowTasks = isCrewmate && !hasLovers;
  
  if (stats.completedTasks > 0 || shouldShowTasks) {
    const tasksText = maxTasks !== undefined 
      ? `Completed Tasks: ${stats.completedTasks}/${maxTasks}`
      : `Completed Tasks: ${stats.completedTasks}`;
    statParts.push({
      text: tasksText,
      color: undefined // Bez specjalnego koloru
    });
  }

  // Dodaj nowe statystyki (identycznie z /dramaafera/)
  if (stats.survivedRounds !== undefined && stats.survivedRounds >= 0) {
    statParts.push({
      text: `Survived Rounds: ${stats.survivedRounds}`,
      color: '#06B6D4' // cyjan
    });
  }

  if (stats.disconnected === 1) {
    statParts.push({
      text: '🔌 Disconnected',
      color: '#EF4444' // czerwony
    });
  }

  // Dodaj specjalne informacje (identycznie z /dramaafera/)
  if (stats.win > 0) {
    statParts.push({ text: '🏆 Winner', color: '#FFD700' }); // złoty
  }

  return statParts;
}

// Fetch all games summary
export async function getGamesList(): Promise<GameSummary[]> {
  const prisma = await getDatabaseClient();
  
  // Return empty array if database is not available (during build time)
  if (!prisma) {
    return [];
  }
  
  const dbGames = await prisma.game.findMany({
    where: withoutDeleted,
    include: {
      gamePlayerStatistics: {
        include: {
          player: true,
          roleHistory: {
            orderBy: { order: 'asc' }
          }
        }
      }
    },
    orderBy: { startTime: 'desc' }
  });

  const games = dbGames.map(game => {
    const playerNames = game.gamePlayerStatistics.map(stat => stat.player.name);
    const winners = game.gamePlayerStatistics.filter(stat => stat.win);
    const winnerNames = winners.map(winner => winner.player.name);
    
    // Determine winner colors based on roles
    const winnerColors: Record<string, string> = {};
    winners.forEach(winner => {
      // Use the last role in history (like old system)
      const roleHistory = winner.roleHistory.sort((a, b) => a.order - b.order);
      const finalRole = roleHistory[roleHistory.length - 1]?.roleName || '';
      const displayRoleName = convertRoleNameForDisplay(finalRole);
      winnerColors[winner.player.name] = getRoleColor(displayRoleName);
    });

    // Calculate winner dynamically like old system
    const winnerInfo = calculateWinnerFromStats(game.gamePlayerStatistics);

    return {
      id: game.gameIdentifier,
      date: extractDateFromGameId(game.gameIdentifier),
      gameNumber: 0, // Will be computed after all games are fetched
      duration: formatDuration(game.startTime, game.endTime),
      players: game.gamePlayerStatistics.length,
      winner: winnerInfo.winner,
      winnerColor: winnerInfo.winnerColor,
      winCondition: winnerInfo.winCondition,
      map: game.map || 'Unknown',
      winnerNames,
      winnerColors,
      allPlayerNames: playerNames
    };
  });

  // Compute game numbers for each date
  const gamesByDate = new Map<string, GameSummary[]>();
  
  // Group games by date
  games.forEach(game => {
    const date = game.date;
    if (!gamesByDate.has(date)) {
      gamesByDate.set(date, []);
    }
    gamesByDate.get(date)!.push(game);
  });

  // Sort games within each date by start time and assign numbers
  gamesByDate.forEach((gamesForDate) => {
    // Sort by game identifier (which includes time) to maintain chronological order
    gamesForDate.sort((a, b) => a.id.localeCompare(b.id));
    
    // Assign game numbers starting from 1
    gamesForDate.forEach((game, index) => {
      game.gameNumber = index + 1;
    });
  });

  return games;
}

// Fetch games by specific date
export async function getGamesListByDate(date: string): Promise<GameSummary[]> {
  const allGames = await getGamesList();
  return allGames
    .filter(game => extractDateFromGameId(game.id) === date)
    .sort((a, b) => b.id.localeCompare(a.id)); // Sort descending for display (newest first)
}

// Fetch list of dates with games
export async function getGameDatesList(): Promise<DateWithGames[]> {
  const games = await getGamesList();
  
  // Return empty array if no games available (during build time)
  if (games.length === 0) {
    return [];
  }
  
  const dateGroups = new Map<string, GameSummary[]>();
  
  // Group games by date
  games.forEach(game => {
    const date = extractDateFromGameId(game.id);
    if (!dateGroups.has(date)) {
      dateGroups.set(date, []);
    }
    dateGroups.get(date)!.push(game);
  });
  
  // Convert to array and sort by newest date
  const datesWithGames: DateWithGames[] = Array.from(dateGroups.entries()).map(([date, games]) => ({
    date,
    displayDate: formatDisplayDate(date),
    games: games.sort((a, b) => b.id.localeCompare(a.id)),
    totalGames: games.length
  }));
  
  return datesWithGames.sort((a, b) => b.date.localeCompare(a.date));
}

// Fetch detailed game data
export async function getGameData(gameId: string): Promise<UIGameData | null> {
  const prisma = await getDatabaseClient();
  
  // Return null if database is not available (during build time)
  if (!prisma) {
    return null;
  }
  
  const game = await prisma.game.findUnique({
    where: { 
      gameIdentifier: gameId,
      ...withoutDeleted 
    },
    include: {
      gamePlayerStatistics: {
        include: {
          player: true,
          roleHistory: {
            orderBy: { order: 'asc' }
          },
          modifiers: true
        }
      },
      meetings: {
        include: {
          meetingVotes: {
            include: {
              target: true,
              voter: true
            }
          },
          skipVotes: {
            include: {
              player: true
            }
          },
          noVotes: {
            include: {
              player: true
            }
          },
          blackmailedPlayers: {
            include: {
              player: true
            }
          },
          jailedPlayers: {
            include: {
              player: true
            }
          }
        },
        orderBy: { meetingNumber: 'asc' }
      },
      gameEvents: {
        orderBy: { timestamp: 'asc' }
      }
    }
  });

  if (!game) {
    return null;
  }

  const winners = game.gamePlayerStatistics.filter(stat => stat.win);
  const winnerNames = winners.map(winner => winner.player.name);
  const winnerColors: Record<string, string> = {};
  winners.forEach(winner => {
    // Use the last role in history (like old system)
    const roleHistory = winner.roleHistory.sort((a, b) => a.order - b.order);
    const finalRole = roleHistory[roleHistory.length - 1]?.roleName || '';
    const displayRoleName = convertRoleNameForDisplay(finalRole);
    winnerColors[winner.player.name] = getRoleColor(displayRoleName);
  });

  // Build player stats for detailed UI
  const playersData: UIPlayerData[] = game.gamePlayerStatistics.map(stat => {
    const roleHistory = stat.roleHistory.map(role => role.roleName);
    const primaryRole = roleHistory[0] || 'Unknown';
    // Use final role for color (like old system)
    const finalRole = roleHistory[roleHistory.length - 1] || 'Unknown';
    const displayRoleName = convertRoleNameForDisplay(finalRole);
    
    // Handle both formats: string array (old format) and object array (database format)
    const modifiers = stat.modifiers.map(modifier => 
      typeof modifier === 'string' ? modifier : modifier.modifierName
    ).filter(mod => mod && mod.trim() !== ''); // Remove empty strings
    
    const team = determineTeam(roleHistory);

    return {
      nickname: stat.player.name,
      role: primaryRole,
      roleColor: getRoleColor(displayRoleName),
      roleHistory,
      modifiers,
      modifierColors: modifiers.map(mod => getModifierColor(mod)),
      team,
      survived: !stat.disconnected,
      tasksCompleted: stat.completedTasks,
      totalTasks: game.maxTasks || undefined,
      kills: stat.correctKills + stat.incorrectKills,
      deaths: stat.disconnected ? 1 : 0,
      meetings: undefined,
      win: stat.win,
      totalPoints: stat.totalPoints,
      correctKills: stat.correctKills,
      incorrectKills: stat.incorrectKills,
      correctProsecutes: stat.correctProsecutes,
      incorrectProsecutes: stat.incorrectProsecutes,
      correctGuesses: stat.correctGuesses,
      incorrectGuesses: stat.incorrectGuesses,
      correctDeputyShoots: stat.correctDeputyShoots,
      incorrectDeputyShoots: stat.incorrectDeputyShoots,
      correctJailorExecutes: stat.correctJailorExecutes,
      incorrectJailorExecutes: stat.incorrectJailorExecutes,
      correctMedicShields: stat.correctMedicShields,
      incorrectMedicShields: stat.incorrectMedicShields,
      correctWardenFortifies: stat.correctWardenFortifies,
      incorrectWardenFortifies: stat.incorrectWardenFortifies,
      janitorCleans: stat.janitorCleans,
      completedTasks: stat.completedTasks,
      survivedRounds: stat.survivedRounds,
      correctAltruistRevives: stat.correctAltruistRevives,
      incorrectAltruistRevives: stat.incorrectAltruistRevives,
      correctSwaps: stat.correctSwaps,
      incorrectSwaps: stat.incorrectSwaps,
      originalStats: {
        playerName: stat.player.name,
        roleHistory: stat.roleHistory.map(role => role.roleName),
        modifiers: stat.modifiers.map(modifier => 
          typeof modifier === 'string' ? modifier : modifier.modifierName
        ).filter(mod => mod && mod.trim() !== ''),
        win: stat.win ? 1 : 0,
        disconnected: stat.disconnected ? 1 : 0,
        initialRolePoints: stat.initialRolePoints || 0,
        correctKills: stat.correctKills,
        incorrectKills: stat.incorrectKills,
        correctProsecutes: stat.correctProsecutes,
        incorrectProsecutes: stat.incorrectProsecutes,
        correctGuesses: stat.correctGuesses,
        incorrectGuesses: stat.incorrectGuesses,
        correctDeputyShoots: stat.correctDeputyShoots,
        incorrectDeputyShoots: stat.incorrectDeputyShoots,
        correctJailorExecutes: stat.correctJailorExecutes,
        incorrectJailorExecutes: stat.incorrectJailorExecutes,
        correctMedicShields: stat.correctMedicShields,
        incorrectMedicShields: stat.incorrectMedicShields,
        correctWardenFortifies: stat.correctWardenFortifies,
        incorrectWardenFortifies: stat.incorrectWardenFortifies,
        janitorCleans: stat.janitorCleans,
        completedTasks: stat.completedTasks,
        survivedRounds: stat.survivedRounds,
        correctAltruistRevives: stat.correctAltruistRevives,
        incorrectAltruistRevives: stat.incorrectAltruistRevives,
        correctSwaps: stat.correctSwaps,
        incorrectSwaps: stat.incorrectSwaps,
        totalPoints: stat.totalPoints
      }
    };
  });

  // Build meetings data
  const meetings = game.meetings.map(meeting => {
    const votes: Record<string, string[]> = {};
    
    meeting.meetingVotes.forEach(vote => {
      const targetName = vote.target.name;
      const voterName = vote.voter.name;
      
      if (!votes[targetName]) {
        votes[targetName] = [];
      }
      votes[targetName].push(voterName);
    });

    const deathsSinceLastMeeting = JSON.parse(meeting.deathsSinceLastMeeting || '[]');

    return {
      meetingNumber: meeting.meetingNumber,
      deathsSinceLastMeeting,
      votes,
      skipVotes: meeting.skipVotes.map(vote => vote.player.name),
      noVotes: meeting.noVotes.map(vote => vote.player.name),
      blackmailedPlayers: meeting.blackmailedPlayers.map(player => player.player.name),
      jailedPlayers: meeting.jailedPlayers.map(player => player.player.name),
      wasTie: meeting.wasTie,
      wasBlessed: meeting.wasBlessed
    };
  });

  // Build events data
  const events = game.gameEvents.map(event => ({
    timestamp: event.timestamp.toString(),
    type: (event.eventType || 'other') as 'kill' | 'meeting' | 'vote' | 'task' | 'sabotage' | 'fix' | 'vent' | 'other',
    player: 'Unknown', // Player relation not loaded, would need playerId lookup
    target: undefined, // Target relation not loaded, would need targetId lookup
    description: event.description
  }));

  return {
    id: game.gameIdentifier,
    date: extractDateFromGameId(game.gameIdentifier),
    gameNumber: 1, // Will be computed if needed for individual game queries
    startTime: game.startTime.toISOString(),
    endTime: game.endTime.toISOString(),
    duration: formatDuration(game.startTime, game.endTime),
    map: game.map || 'Unknown',
    ...calculateWinnerFromStats(game.gamePlayerStatistics),
    winnerNames,
    winnerColors,
    players: game.gamePlayerStatistics.length,
    maxTasks: game.maxTasks || undefined,
    detailedStats: {
      playersData,
      meetings,
      events
    }
  };
}

// Fetch player statistics across all games
export async function getPlayerStats(playerName: string): Promise<PlayerStats | null> {
  const prisma = await getDatabaseClient();
  
  // Return null if database is not available (during build time)
  if (!prisma) {
    return null;
  }
  
  const player = await prisma.player.findFirst({
    where: { 
      name: playerName,
      ...withoutDeleted 
    },
    include: {
      gamePlayerStatistics: {
        include: {
          roleHistory: {
            orderBy: { order: 'asc' }
          },
          modifiers: true,
          game: true
        }
      }
    }
  });

  if (!player) {
    return null;
  }

  const totalGames = player.gamePlayerStatistics.length;
  const wins = player.gamePlayerStatistics.filter(stat => stat.win).length;
  const losses = totalGames - wins;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
  const totalPoints = player.gamePlayerStatistics.reduce((sum, stat) => sum + stat.totalPoints, 0);
  const averagePoints = totalGames > 0 ? totalPoints / totalGames : 0;

  // Aggregate roles
  const roles: Record<string, number> = {};
  const modifiers: Record<string, number> = {};
  const teamStats = {
    crewmate: { games: 0, wins: 0 },
    impostor: { games: 0, wins: 0 },
    neutral: { games: 0, wins: 0 }
  };

  player.gamePlayerStatistics.forEach(stat => {
    stat.roleHistory.forEach(role => {
      roles[role.roleName] = (roles[role.roleName] || 0) + 1;
    });

    stat.modifiers.forEach(modifier => {
      modifiers[modifier.modifierName] = (modifiers[modifier.modifierName] || 0) + 1;
    });

    // Determine team based on primary role
    const primaryRole = stat.roleHistory.find(role => role.order === 0)?.roleName || '';
    const teamName = determineTeam(primaryRole);
    const team: 'crewmate' | 'impostor' | 'neutral' = 
      teamName === Teams.Impostor ? 'impostor' :
      teamName === Teams.Neutral ? 'neutral' : 'crewmate';

    teamStats[team].games++;
    if (stat.win) {
      teamStats[team].wins++;
    }
  });

  const favoriteRole = Object.entries(roles).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
  const favoriteTeam = Object.entries(teamStats).sort(([,a], [,b]) => b.games - a.games)[0]?.[0] || 'crewmate';

  return {
    nickname: player.name,
    totalGames,
    wins,
    losses,
    winRate,
    totalPoints,
    averagePoints,
    roles,
    modifiers,
    favoriteRole,
    favoriteTeam,
    teamStats
  };
}

// Interface for ranking statistics
export interface PlayerRankingStats {
  name: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  rankingPoints?: number;
}

// Interface for role ranking statistics
export interface RoleRankingStats {
  name: string;
  displayName: string;
  color: string;
  team: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  averagePoints: number;
  players: Array<{
    playerName: string;
    gamesPlayed: number;
    wins: number;
    winRate: number;
    averagePoints: number;
  }>;
}

// Player ranking points data (manually maintained)
const playerRankingPoints: Record<string, number> = {
  "Cleopatrie": 2303,
  "ziomson": 2224,
  "brubel": 2165,
  "Dziekansqr": 2133,
  "DawDu": 2122,
  "Mamika": 2077,
  "Jakubeq": 2016,
  "Nudna": 1983,
  "QukaVadi": 1969,
  "Zieloony": 1961,
  "Miras": 1926,
  "Budyn": 1907,
};

// Get all games data (equivalent to getAllGamesData from converter)
export async function getAllGamesData(): Promise<UIGameData[]> {
  const prisma = await getDatabaseClient();
  
  // Return empty array if database is not available (during build time)
  if (!prisma) {
    return [];
  }

  const games = await prisma.game.findMany({
    where: withoutDeleted,
    include: {
      gamePlayerStatistics: {
        where: {
          player: withoutDeleted
        },
        include: {
          player: {
            select: {
              id: true,
              name: true
            }
          },
          roleHistory: {
            orderBy: {
              order: 'asc'
            }
          },
          modifiers: true
        }
      },
      // Skip complex relations for now
      // gameEvents: true,
      // meetings: true
    },
    orderBy: {
      startTime: 'desc'
    }
  });

  return games.map(game => {
    const duration = formatDuration(game.startTime || new Date(), game.endTime || new Date());
    const gameDate = extractDateFromGameId(game.gameIdentifier || '');
    const displayDate = formatDisplayDate(gameDate);

    // Process players
    type GamePlayerStatWithIncludes = Prisma.GamePlayerStatisticsGetPayload<{
      include: {
        player: { select: { id: true; name: true } };
        roleHistory: { orderBy: { order: 'asc' } };
        modifiers: true;
      };
    }>;

    const playersData: UIPlayerData[] = (game.gamePlayerStatistics || []).map((stat: GamePlayerStatWithIncludes) => {
      const primaryRole = stat.roleHistory?.find((role: { order: number; roleName: string }) => role.order === 0)?.roleName || 'Unknown';
      // Use final role for color (like old system)
      const roleHistorySorted = (stat.roleHistory || []).sort((a, b) => a.order - b.order);
      const finalRole = roleHistorySorted[roleHistorySorted.length - 1]?.roleName || 'Unknown';
      const roleHistoryNames = roleHistorySorted.map(role => role.roleName);
      const displayRoleName = convertRoleNameForDisplay(finalRole);
      const roleColor = getRoleColor(displayRoleName);
      const team = determineTeam(roleHistoryNames);
      const modifierNames = (stat.modifiers || []).map((mod: { modifierName: string }) => mod.modifierName);
      const modifierColors = modifierNames.map(getModifierColor);

      return {
        nickname: stat.player?.name || 'Unknown',
        role: primaryRole,
        roleColor,
        roleHistory: (stat.roleHistory || []).map((role: { roleName: string }) => role.roleName),
        modifiers: modifierNames,
        modifierColors,
        team: team === Teams.Impostor ? 'Impostor' : team === Teams.Neutral ? 'Neutral' : 'Crewmate',
        survived: !stat.disconnected,
        tasksCompleted: stat.completedTasks,
        totalTasks: game.maxTasks || 0,
        kills: stat.correctKills + stat.incorrectKills,
        deaths: 0, // Would need additional data
        meetings: 0, // Would need additional data
        totalPoints: stat.totalPoints,
        win: stat.win,
        correctKills: stat.correctKills,
        incorrectKills: stat.incorrectKills,
        correctProsecutes: stat.correctProsecutes,
        incorrectProsecutes: stat.incorrectProsecutes,
        correctGuesses: stat.correctGuesses,
        incorrectGuesses: stat.incorrectGuesses,
        correctDeputyShoots: stat.correctDeputyShoots,
        incorrectDeputyShoots: stat.incorrectDeputyShoots,
        correctJailorExecutes: stat.correctJailorExecutes,
        incorrectJailorExecutes: stat.incorrectJailorExecutes,
        correctMedicShields: stat.correctMedicShields,
        incorrectMedicShields: stat.incorrectMedicShields,
        correctWardenFortifies: stat.correctWardenFortifies,
        incorrectWardenFortifies: stat.incorrectWardenFortifies,
        janitorCleans: stat.janitorCleans,
        completedTasks: stat.completedTasks,
        survivedRounds: stat.survivedRounds,
        correctAltruistRevives: stat.correctAltruistRevives,
        incorrectAltruistRevives: stat.incorrectAltruistRevives,
        correctSwaps: stat.correctSwaps,
        incorrectSwaps: stat.incorrectSwaps,
        originalStats: {
          playerName: stat.player?.name || 'Unknown',
          roleHistory: (stat.roleHistory || []).map((role: { roleName: string }) => role.roleName),
          modifiers: (stat.modifiers || []).map((mod: { modifierName: string }) => mod.modifierName),
          win: stat.win ? 1 : 0,
          disconnected: stat.disconnected ? 1 : 0,
          initialRolePoints: stat.initialRolePoints || 0,
          correctKills: stat.correctKills,
          incorrectKills: stat.incorrectKills,
          correctProsecutes: stat.correctProsecutes,
          incorrectProsecutes: stat.incorrectProsecutes,
          correctGuesses: stat.correctGuesses,
          incorrectGuesses: stat.incorrectGuesses,
          correctDeputyShoots: stat.correctDeputyShoots,
          incorrectDeputyShoots: stat.incorrectDeputyShoots,
          correctJailorExecutes: stat.correctJailorExecutes,
          incorrectJailorExecutes: stat.incorrectJailorExecutes,
          correctMedicShields: stat.correctMedicShields,
          incorrectMedicShields: stat.incorrectMedicShields,
          correctWardenFortifies: stat.correctWardenFortifies,
          incorrectWardenFortifies: stat.incorrectWardenFortifies,
          janitorCleans: stat.janitorCleans,
          completedTasks: stat.completedTasks,
          survivedRounds: stat.survivedRounds,
          correctAltruistRevives: stat.correctAltruistRevives,
          incorrectAltruistRevives: stat.incorrectAltruistRevives,
          correctSwaps: stat.correctSwaps,
          incorrectSwaps: stat.incorrectSwaps,
          totalPoints: stat.totalPoints
        }
      } as UIPlayerData;
    });

    // Determine winners
    const winners = playersData.filter(p => p.win);
    const winnerNames = winners.map(w => w.nickname);
    const winnerColors: Record<string, string> = {};
    winners.forEach(winner => {
      winnerColors[winner.nickname] = winner.roleColor;
    });

    let winner = 'Unknown';
    let winnerColor = '#808080';
    
    if (winners.length > 0) {
      // Use same logic as old system with team priorities
      
      // Check for Lovers special case first
      const allHaveLoverModifier = winners.length > 1 && winners.every(w => 
        w.modifiers.some(mod => mod.toLowerCase() === 'lover')
      );
      
      if (allHaveLoverModifier) {
        winner = 'Lovers';
        winnerColor = '#FF69B4';
      } else {
        // PRIORITY 1: Check for Impostors (highest priority)
        const impostorWinners = winners.filter(w => w.team === 'Impostor');
        
        if (impostorWinners.length > 0) {
          winner = 'Impostor';
          winnerColor = getTeamColor(Teams.Impostor);
        } else {
          // PRIORITY 2: Check for Crewmates (medium priority)
          const crewmateWinners = winners.filter(w => w.team === 'Crewmate');
          
          if (crewmateWinners.length > 0) {
            winner = 'Crewmate';
            winnerColor = getTeamColor(Teams.Crewmate);
          } else {
            // PRIORITY 3: Check for Neutrals (lowest priority)
            const neutralWinners = winners.filter(w => w.team === 'Neutral');
            
            if (neutralWinners.length > 0) {
              // For neutrals, use the specific role name (like Vampire, Jester, etc.)
              const firstNeutral = neutralWinners[0];
              const finalRole = firstNeutral.roleHistory && firstNeutral.roleHistory.length > 0 
                ? firstNeutral.roleHistory[firstNeutral.roleHistory.length - 1]
                : firstNeutral.role;
              winner = finalRole || 'Neutral';
              winnerColor = firstNeutral.roleColor;
            }
          }
        }
      }
    }

    // Simplified events and meetings for now
    const events: UIGameEvent[] = [];
    const meetings: UIMeetingData[] = [];

    return {
      id: game.gameIdentifier || String(game.id),
      date: displayDate,
      gameNumber: 0, // Will be calculated separately
      startTime: game.startTime?.toISOString() || '',
      endTime: game.endTime?.toISOString() || '',
      duration,
      map: game.map || 'Unknown',
      winner,
      winnerColor,
      winCondition: game.winCondition || 'Unknown',
      winnerNames,
      winnerColors,
      players: playersData.length,
      maxTasks: game.maxTasks || undefined,
      detailedStats: {
        playersData,
        events,
        meetings,
        gameSettings: null
      }
    };
  });
}

// Generate player ranking statistics
export async function generatePlayerRankingStats(): Promise<PlayerRankingStats[]> {
  const allGames = await getAllGamesData();
  const playerStats = new Map<string, { played: number; won: number }>();
  
  // Iterate through all games and count statistics
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
  
  // Convert to array with calculated win rate
  const rankingStats: PlayerRankingStats[] = Array.from(playerStats.entries()).map(([playerName, stats]) => ({
    name: playerName,
    gamesPlayed: stats.played,
    wins: stats.won,
    winRate: stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0,
    rankingPoints: playerRankingPoints[playerName]
  }));
  
  // Sort by win rate (descending), then by number of games (descending)
  rankingStats.sort((a, b) => {
    if (a.winRate !== b.winRate) {
      return b.winRate - a.winRate;
    }
    return b.gamesPlayed - a.gamesPlayed;
  });
  
  return rankingStats;
}

// Generate role ranking statistics
export async function generateRoleRankingStats(): Promise<RoleRankingStats[]> {
  const allGames = await getAllGamesData();
  const roleStats = new Map<string, {
    gamesPlayed: number;
    wins: number;
    totalPoints: number;
    players: Map<string, { gamesPlayed: number; wins: number; totalPoints: number }>;
  }>();

  // Iterate through all games and collect role statistics
  allGames.forEach(game => {
    game.detailedStats.playersData.forEach(player => {
      const roleName = player.role;
      const playerName = player.nickname;

      if (!roleStats.has(roleName)) {
        roleStats.set(roleName, {
          gamesPlayed: 0,
          wins: 0,
          totalPoints: 0,
          players: new Map()
        });
      }

      const roleData = roleStats.get(roleName)!;
      roleData.gamesPlayed += 1;
      roleData.totalPoints += player.totalPoints;

      if (player.win) {
        roleData.wins += 1;
      }

      // Track per-player statistics for this role
      if (!roleData.players.has(playerName)) {
        roleData.players.set(playerName, { gamesPlayed: 0, wins: 0, totalPoints: 0 });
      }

      const playerRoleData = roleData.players.get(playerName)!;
      playerRoleData.gamesPlayed += 1;
      playerRoleData.totalPoints += player.totalPoints;

      if (player.win) {
        playerRoleData.wins += 1;
      }
    });
  });

  // Convert to final format
  const roleRankingStats: RoleRankingStats[] = Array.from(roleStats.entries()).map(([roleName, data]) => {
    const winRate = data.gamesPlayed > 0 ? Math.round((data.wins / data.gamesPlayed) * 100) : 0;
    const averagePoints = data.gamesPlayed > 0 ? Math.round(data.totalPoints / data.gamesPlayed) : 0;

    // Get role color and team
    const displayRoleName = convertRoleNameForDisplay(roleName);
    const roleColor = getRoleColor(displayRoleName);
    const roleTeam = determineTeam(roleName);
    const teamName = roleTeam === Teams.Impostor ? 'Impostor' : 
                    roleTeam === Teams.Neutral ? 'Neutral' : 'Crewmate';

    const players = Array.from(data.players.entries()).map(([playerName, playerData]) => ({
      playerName,
      gamesPlayed: playerData.gamesPlayed,
      wins: playerData.wins,
      winRate: playerData.gamesPlayed > 0 ? Math.round((playerData.wins / playerData.gamesPlayed) * 100) : 0,
      averagePoints: playerData.gamesPlayed > 0 ? Math.round(playerData.totalPoints / playerData.gamesPlayed) : 0
    }));

    // Sort players by games played (descending), then by win rate (descending)
    players.sort((a, b) => {
      if (a.gamesPlayed !== b.gamesPlayed) {
        return b.gamesPlayed - a.gamesPlayed;
      }
      return b.winRate - a.winRate;
    });

    return {
      name: roleName,
      displayName: normalizeRoleName(roleName),
      color: roleColor,
      team: teamName,
      gamesPlayed: data.gamesPlayed,
      wins: data.wins,
      winRate,
      averagePoints,
      players
    };
  });

  // Sort roles by games played (descending)
  roleRankingStats.sort((a, b) => b.gamesPlayed - a.gamesPlayed);

  return roleRankingStats;
}

// Get list of all players from database
export async function getPlayersList(): Promise<string[]> {
  const prisma = await getDatabaseClient();
  
  if (!prisma) {
    return [];
  }

  try {
    const players = await prisma.player.findMany({
      where: withoutDeleted,
      select: {
        name: true
      },
      distinct: ['name']
    });

    return players.map(p => p.name);
  } catch (error) {
    console.error('Error fetching players list:', error);
    return [];
  }
}

// Get user profile statistics from database
export async function getUserProfileStats(playerName: string): Promise<UserProfileStats | null> {
  const prisma = await getDatabaseClient();
  
  if (!prisma) {
    return null;
  }

  try {
    const player = await prisma.player.findFirst({
      where: {
        name: playerName,
        ...withoutDeleted
      },
      include: {
        gamePlayerStatistics: {
          include: {
            roleHistory: {
              orderBy: { order: 'asc' }
            },
            modifiers: true
          }
        }
      }
    });

    if (!player || player.gamePlayerStatistics.length === 0) {
      return null;
    }

    let gamesPlayed = 0;
    let wins = 0;
    let impostorGames = 0;
    let crewmateGames = 0;
    let neutralGames = 0;
    let totalTasks = 0;
    const maxTasks = 0;
    let correctKills = 0;
    let incorrectKills = 0;
    let correctGuesses = 0;
    let incorrectGuesses = 0;
    let correctProsecutes = 0;
    let incorrectProsecutes = 0;
    let correctDeputyShoots = 0;
    let incorrectDeputyShoots = 0;
    let correctJailorExecutes = 0;
    let incorrectJailorExecutes = 0;
    let correctMedicShields = 0;
    let incorrectMedicShields = 0;
    let correctWardenFortifies = 0;
    let incorrectWardenFortifies = 0;
    let janitorCleans = 0;
    let survivedRounds = 0;
    let totalRounds = 0;
    let correctAltruistRevives = 0;
    let incorrectAltruistRevives = 0;
    let correctSwaps = 0;
    let incorrectSwaps = 0;

    player.gamePlayerStatistics.forEach((stat: GamePlayerStatisticsWithRelations) => {
      gamesPlayed++;
      
      if (stat.win) wins++;

      // Determine team based on primary role
      const primaryRole = stat.roleHistory.find((role: PlayerRole) => role.order === 0)?.roleName || '';
      const teamName = determineTeam(primaryRole);
      
      if (teamName === Teams.Impostor) impostorGames++;
      else if (teamName === Teams.Neutral) neutralGames++;
      else crewmateGames++;

      // Aggregate statistics
      totalTasks += stat.completedTasks || 0;
      correctKills += stat.correctKills || 0;
      incorrectKills += stat.incorrectKills || 0;
      correctGuesses += stat.correctGuesses || 0;
      incorrectGuesses += stat.incorrectGuesses || 0;
      correctProsecutes += stat.correctProsecutes || 0;
      incorrectProsecutes += stat.incorrectProsecutes || 0;
      correctDeputyShoots += stat.correctDeputyShoots || 0;
      incorrectDeputyShoots += stat.incorrectDeputyShoots || 0;
      correctJailorExecutes += stat.correctJailorExecutes || 0;
      incorrectJailorExecutes += stat.incorrectJailorExecutes || 0;
      correctMedicShields += stat.correctMedicShields || 0;
      incorrectMedicShields += stat.incorrectMedicShields || 0;
      correctWardenFortifies += stat.correctWardenFortifies || 0;
      incorrectWardenFortifies += stat.incorrectWardenFortifies || 0;
      janitorCleans += stat.janitorCleans || 0;
      survivedRounds += stat.survivedRounds || 0;
      correctAltruistRevives += stat.correctAltruistRevives || 0;
      incorrectAltruistRevives += stat.incorrectAltruistRevives || 0;
      correctSwaps += stat.correctSwaps || 0;
      incorrectSwaps += stat.incorrectSwaps || 0;
      
      // Count total rounds (approximate from all games)
      totalRounds += (stat.survivedRounds || 0) + (stat.win ? 0 : 1);
    });

    const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

    return {
      name: playerName,
      gamesPlayed,
      wins,
      winRate,
      impostorGames,
      crewmateGames,
      neutralGames,
      totalTasks,
      maxTasks, // Will be calculated from game data if needed
      correctKills,
      incorrectKills,
      correctGuesses,
      incorrectGuesses,
      correctProsecutes,
      incorrectProsecutes,
      correctDeputyShoots,
      incorrectDeputyShoots,
      correctJailorExecutes,
      incorrectJailorExecutes,
      correctMedicShields,
      incorrectMedicShields,
      correctWardenFortifies,
      incorrectWardenFortifies,
      janitorCleans,
      survivedRounds,
      totalRounds,
      correctAltruistRevives,
      incorrectAltruistRevives,
      correctSwaps,
      incorrectSwaps
    };
  } catch (error) {
    console.error('Error fetching user profile stats:', error);
    return null;
  }
}

// Interface for ranking history point
export interface RankingHistoryPoint {
  date: Date;
  score: number;
  reason?: string;
  gameId?: number;
  gameIdentifier?: string;
}

// Get player ranking history from database
export async function getPlayerRankingHistory(playerName: string): Promise<RankingHistoryPoint[]> {
  const prisma = await getDatabaseClient();
  
  if (!prisma) {
    return [];
  }

  try {
    const player = await prisma.player.findFirst({
      where: {
        name: playerName,
        ...withoutDeleted
      }
    });

    if (!player) {
      return [];
    }

    const rankings = await prisma.playerRanking.findMany({
      where: {
        playerId: player.id,
        ...withoutDeleted
      },
      include: {
        game: {
          select: {
            gameIdentifier: true,
            startTime: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return rankings.map(ranking => ({
      date: ranking.game?.startTime || ranking.createdAt, // Użyj daty gry, jeśli dostępna
      score: ranking.score,
      reason: ranking.reason || undefined,
      gameId: ranking.gameId || undefined,
      gameIdentifier: ranking.game?.gameIdentifier || undefined
    }));

  } catch (error) {
    console.error('Error fetching player ranking history:', error);
    return [];
  }
}

// Interface for player's top games
export interface PlayerTopGame {
  gameIdentifier: string;
  date: Date;
  map: string;
  duration: string;
  role: string;
  roleColor: string;
  team: string;
  win: boolean;
  totalPoints: number;
}

// Get player's best games
export async function getPlayerTopGames(playerName: string, limit: number = 3): Promise<{ best: PlayerTopGame[] }> {
  const prisma = await getDatabaseClient();
  
  if (!prisma) {
    return { best: [] };
  }

  try {
    const player = await prisma.player.findFirst({
      where: {
        name: playerName,
        ...withoutDeleted
      }
    });

    if (!player) {
      return { best: [] };
    }

    // Pobierz wszystkie gry gracza ze szczegółami
    const playerGames = await prisma.gamePlayerStatistics.findMany({
      where: {
        playerId: player.id,
        game: withoutDeleted
      },
      include: {
        game: {
          select: {
            gameIdentifier: true,
            startTime: true,
            endTime: true,
            map: true
          }
        },
        roleHistory: {
          orderBy: { order: 'asc' },
          take: 1 // Tylko pierwsza rola
        }
      },
      orderBy: {
        totalPoints: 'desc'
      }
    });

    // Funkcja pomocnicza do mapowania gry
    const mapGame = (stat: typeof playerGames[0]): PlayerTopGame => {
      const roleName = stat.roleHistory[0]?.roleName || 'Unknown';
      const displayRoleName = convertRoleNameForDisplay(roleName);
      const roleColor = getRoleColor(displayRoleName);
      const team = determineTeam(roleName);

      return {
        gameIdentifier: stat.game.gameIdentifier,
        date: stat.game.startTime,
        map: stat.game.map,
        duration: formatDuration(stat.game.startTime, stat.game.endTime),
        role: displayRoleName,
        roleColor,
        team,
        win: stat.win,
        totalPoints: stat.totalPoints
      };
    };

    // Najlepsze gry (największe punkty)
    const best = playerGames.slice(0, limit).map(mapGame);

    return { best };

  } catch (error) {
    console.error('Error fetching player top games:', error);
    return { best: [] };
  }
}

// Interface for voting statistics
export interface VotingStatistics {
  // Podstawowe statystyki
  totalVotesCast: number;        // Ile razy gracz głosował na kogokolwiek
  totalVotesReceived: number;    // Ile razy inni głosowali na tego gracza
  timesVotedOut: number;         // Ile razy został wyrzucony przez głosowanie
  
  // Skip rate
  totalMeetings: number;         // Łączna liczba spotkań
  skipVotes: number;             // Ile razy skipował
  skipRate: number;              // Procent skipów
  
  // Bandwagon factor
  bandwagonFactor: number;       // Jak często głosuje z większością (0-100%)
  
  // Ranking ofiar
  votingTargets: Array<{
    playerName: string;
    voteCount: number;
    percentage: number;
  }>;
  
  // Ranking prześladowców
  votedByPlayers: Array<{
    playerName: string;
    voteCount: number;
    percentage: number;
  }>;
}

/**
 * Pobierz statystyki głosowań gracza
 */
export async function getPlayerVotingStats(
  nick: string
): Promise<VotingStatistics> {
  const prisma = await getDatabaseClient();
  
  if (!prisma) {
    return {
      totalVotesCast: 0,
      totalVotesReceived: 0,
      timesVotedOut: 0,
      totalMeetings: 0,
      skipVotes: 0,
      skipRate: 0,
      bandwagonFactor: 0,
      votingTargets: [],
      votedByPlayers: []
    };
  }

  try {
    const player = await prisma.player.findFirst({
      where: {
        name: nick,
        ...withoutDeleted
      }
    });

    if (!player) {
      return {
        totalVotesCast: 0,
        totalVotesReceived: 0,
        timesVotedOut: 0,
        totalMeetings: 0,
        skipVotes: 0,
        skipRate: 0,
        bandwagonFactor: 0,
        votingTargets: [],
        votedByPlayers: []
      };
    }

    // Zamiast pobierać wszystkie gameIds i używać IN clause (co ma limity),
    // pobierzmy dane bezpośrednio przez relacje
    
    // Głosy oddane przez gracza - bezpośrednio przez voterId, bez używania gameIds
    const votesCast = await prisma.meetingVote.findMany({
      where: {
        voterId: player.id,
        meeting: {
          deletedAt: null,
          game: withoutDeleted
        }
      },
      include: {
        target: true,
        meeting: {
          include: {
            game: true
          }
        }
      }
    });

    // Głosy otrzymane przez gracza - bezpośrednio przez targetId
    const votesReceived = await prisma.meetingVote.findMany({
      where: {
        targetId: player.id,
        meeting: {
          deletedAt: null,
          game: withoutDeleted
        }
      },
      include: {
        voter: true,
        meeting: {
          include: {
            game: true
          }
        }
      }
    });

    // Skipy gracza - bezpośrednio przez playerId
    const skipVotesData = await prisma.meetingSkipVote.findMany({
      where: {
        playerId: player.id,
        meeting: {
          deletedAt: null,
          game: withoutDeleted
        }
      },
      include: {
        meeting: {
          include: {
            game: true
          }
        }
      }
    });

    // Zbierz unikalne meetingIds z głosów i skipów gracza
    const meetingIdsSet = new Set<number>();
    votesCast.forEach(v => meetingIdsSet.add(v.meetingId));
    votesReceived.forEach(v => meetingIdsSet.add(v.meetingId));
    skipVotesData.forEach(s => meetingIdsSet.add(s.meetingId));
    
    // Pobierz tylko te spotkania, gdzie gracz uczestniczył
    const meetingIds = Array.from(meetingIdsSet);
    
    // Pobierz spotkania w batchach aby uniknąć problemów z limitami D1
    const BATCH_SIZE = 100;
    type MeetingWithVotes = Awaited<ReturnType<typeof prisma.meeting.findMany<{
      where: { id: { in: number[] }; deletedAt: null };
      include: { meetingVotes: true };
    }>>>[number];
    const allMeetings: MeetingWithVotes[] = [];
    
    for (let i = 0; i < meetingIds.length; i += BATCH_SIZE) {
      const batchIds = meetingIds.slice(i, i + BATCH_SIZE);
      const batchMeetings = await prisma.meeting.findMany({
        where: {
          id: { in: batchIds },
          deletedAt: null
        },
        include: {
          meetingVotes: true
        }
      });
      allMeetings.push(...batchMeetings);
    }

    // Liczba spotkań, w których gracz brał udział (nie był martwy)
    // Założenie: jeśli gracz nie głosował i nie skipował, prawdopodobnie był martwy
    const meetingsParticipated = new Set<number>();
    votesCast.forEach(v => meetingsParticipated.add(v.meetingId));
    skipVotesData.forEach(s => meetingsParticipated.add(s.meetingId));
    
    const totalMeetings = meetingsParticipated.size;
    const skipVotes = skipVotesData.length;
    const skipRate = totalMeetings > 0 ? (skipVotes / totalMeetings) * 100 : 0;

    // Oblicz ile razy został wygłosowany
    // Gracz został wygłosowany jeśli dostał najwięcej głosów i nie było tie
    let timesVotedOut = 0;
    allMeetings.forEach(meeting => {
      if (meeting.wasTie) return; // Jeśli był tie, nikt nie został wygłosowany
      
      const voteCounts = new Map<number, number>();
      meeting.meetingVotes.forEach((vote: { targetId: number }) => {
        voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) || 0) + 1);
      });
      
      if (voteCounts.size === 0) return; // Nikt nie głosował
      
      const maxVotes = Math.max(...voteCounts.values());
      const playersWithMaxVotes = Array.from(voteCounts.entries())
        .filter(([_, count]) => count === maxVotes)
        .map(([playerId, _]) => playerId);
      
      // Jeśli tylko jeden gracz dostał najwięcej głosów i to był nasz gracz
      if (playersWithMaxVotes.length === 1 && playersWithMaxVotes[0] === player.id) {
        timesVotedOut++;
      }
    });

    // Oblicz Bandwagon Factor
    // Dla każdego głosu sprawdź, czy gracz głosował na osobę, która dostała najwięcej głosów
    let bandwagonVotes = 0;
    const meetingVoteCounts = new Map<number, Map<number, number>>();
    
    // Pogrupuj głosy po spotkaniach
    allMeetings.forEach(meeting => {
      const voteCounts = new Map<number, number>();
      meeting.meetingVotes.forEach((vote: { targetId: number }) => {
        voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) || 0) + 1);
      });
      meetingVoteCounts.set(meeting.id, voteCounts);
    });

    // Sprawdź czy głosy gracza były zgodne z większością
    votesCast.forEach(vote => {
      const voteCounts = meetingVoteCounts.get(vote.meetingId);
      if (!voteCounts) return;
      
      const maxVotes = Math.max(...voteCounts.values());
      const voteCountForTarget = voteCounts.get(vote.targetId) || 0;
      
      if (voteCountForTarget === maxVotes && maxVotes > 0) {
        bandwagonVotes++;
      }
    });

    const bandwagonFactor = votesCast.length > 0 
      ? (bandwagonVotes / votesCast.length) * 100 
      : 0;

    // Ranking ofiar (na kogo gracz głosuje)
    const targetCounts = new Map<string, number>();
    votesCast.forEach(vote => {
      const name = vote.target.name;
      targetCounts.set(name, (targetCounts.get(name) || 0) + 1);
    });

    const votingTargets = Array.from(targetCounts.entries())
      .map(([playerName, voteCount]) => ({
        playerName,
        voteCount,
        percentage: (voteCount / votesCast.length) * 100
      }))
      .sort((a, b) => b.voteCount - a.voteCount);

    // Ranking prześladowców (kto głosuje na gracza)
    const voterCounts = new Map<string, number>();
    votesReceived.forEach(vote => {
      const name = vote.voter.name;
      voterCounts.set(name, (voterCounts.get(name) || 0) + 1);
    });

    const votedByPlayers = Array.from(voterCounts.entries())
      .map(([playerName, voteCount]) => ({
        playerName,
        voteCount,
        percentage: (voteCount / votesReceived.length) * 100
      }))
      .sort((a, b) => b.voteCount - a.voteCount);

    return {
      totalVotesCast: votesCast.length,
      totalVotesReceived: votesReceived.length,
      timesVotedOut,
      totalMeetings,
      skipVotes,
      skipRate: Math.round(skipRate * 10) / 10,
      bandwagonFactor: Math.round(bandwagonFactor * 10) / 10,
      votingTargets,
      votedByPlayers
    };

  } catch (error) {
    console.error('Error fetching player voting stats:', error);
    return {
      totalVotesCast: 0,
      totalVotesReceived: 0,
      timesVotedOut: 0,
      totalMeetings: 0,
      skipVotes: 0,
      skipRate: 0,
      bandwagonFactor: 0,
      votingTargets: [],
      votedByPlayers: []
    };
  }
}

/**
 * Pobierz liczbę gwiazdek gracza (dni, w których miał najwięcej punktów)
 * Gwiazdka z ostatniej sesji pojawia się dopiero po pojawieniu się gry z nowej daty
 */
export async function getPlayerStars(nick: string): Promise<number> {
  const prisma = await getDatabaseClient();
  
  if (!prisma) {
    return 0;
  }

  try {
    const player = await prisma.player.findFirst({
      where: {
        name: nick,
        ...withoutDeleted
      }
    });

    if (!player) {
      return 0;
    }

    // Pobierz wszystkie gry pogrupowane po dacie
    const allGames = await prisma.game.findMany({
      where: {
        deletedAt: null
      },
      select: {
        id: true,
        startTime: true,
        gamePlayerStatistics: {
          select: {
            playerId: true,
            totalPoints: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Pogrupuj gry po dacie (YYYY-MM-DD)
    const gamesByDate = new Map<string, typeof allGames>();
    allGames.forEach(game => {
      const dateKey = game.startTime.toISOString().split('T')[0];
      if (!gamesByDate.has(dateKey)) {
        gamesByDate.set(dateKey, []);
      }
      gamesByDate.get(dateKey)!.push(game);
    });

    // Pobierz wszystkie unikalne daty i posortuj
    const allDates = Array.from(gamesByDate.keys()).sort();
    
    // Jeśli jest tylko jedna data lub brak dat, zwróć 0
    if (allDates.length <= 1) {
      return 0;
    }

    // Sprawdź każdą datę oprócz ostatniej (najnowszej)
    let stars = 0;
    for (let i = 0; i < allDates.length - 1; i++) {
      const dateKey = allDates[i];
      const gamesOnDate = gamesByDate.get(dateKey)!;
      
      // Oblicz sumę punktów dla każdego gracza w tym dniu
      const playerPoints = new Map<number, number>();
      
      gamesOnDate.forEach(game => {
        game.gamePlayerStatistics.forEach(stat => {
          const currentPoints = playerPoints.get(stat.playerId) || 0;
          playerPoints.set(stat.playerId, currentPoints + stat.totalPoints);
        });
      });

      // Znajdź maksymalną liczbę punktów
      if (playerPoints.size === 0) continue;
      
      const maxPoints = Math.max(...playerPoints.values());
      const playersWithMaxPoints = Array.from(playerPoints.entries())
        .filter(([_, points]) => points === maxPoints)
        .map(([playerId, _]) => playerId);

      // Jeśli nasz gracz ma najwięcej punktów (i jest sam z tym wynikiem)
      if (playersWithMaxPoints.length === 1 && playersWithMaxPoints[0] === player.id) {
        stars++;
      }
    }

    return stars;

  } catch (error) {
    console.error('Error fetching player stars:', error);
    return 0;
  }
}