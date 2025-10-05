import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../api/_database';
import { withoutDeleted } from '../../api/schema/common';
import { Roles } from '@/roles';
import { Modifiers } from '@/modifiers';
import { Teams } from '@/constants/teams';
import type { Prisma } from '../../api/_database';

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

  // Znajdź rolę w definicjach
  const role = Roles.find(r => 
    r.name.toLowerCase() === roleName.toLowerCase() || 
    r.id.toLowerCase() === roleName.toLowerCase()
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
  // Handle array input (for compatibility with existing code)
  const roleToCheck = Array.isArray(roleName) ? roleName[0] : roleName;
  
  const role = Roles.find(r => 
    r.name.toLowerCase() === roleToCheck.toLowerCase() || 
    r.id.toLowerCase() === roleToCheck.toLowerCase()
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
  
  // Mapowanie nazw statystyk na polskie nazwy z kolorami
  const statLabels: Record<string, { label: string; color?: string }> = {
    'correctKills': { label: 'Poprawne zabójstwa', color: '#22C55E' }, // zielony
    'incorrectKills': { label: 'Niepoprawne zabójstwa', color: '#EF4444' }, // czerwony
    'correctProsecutes': { label: 'Poprawne oskarżenia', color: '#22C55E' },
    'incorrectProsecutes': { label: 'Niepoprawne oskarżenia', color: '#EF4444' },
    'correctGuesses': { label: 'Poprawne zgadnięcia', color: '#22C55E' },
    'incorrectGuesses': { label: 'Niepoprawne zgadnięcia', color: '#EF4444' },
    'correctDeputyShoots': { label: 'Poprawne strzały deputata', color: '#22C55E' },
    'incorrectDeputyShoots': { label: 'Niepoprawne strzały deputata', color: '#EF4444' },
    'correctJailorExecutes': { label: 'Poprawne egzekucje więźniarza', color: '#22C55E' },
    'incorrectJailorExecutes': { label: 'Niepoprawne egzekucje więźniarza', color: '#EF4444' },
    'correctMedicShields': { label: 'Poprawne tarcze medyka', color: '#22C55E' },
    'incorrectMedicShields': { label: 'Niepoprawne tarcze medyka', color: '#EF4444' },
    'correctWardenFortifies': { label: 'Poprawne umocnienia strażnika', color: '#22C55E' },
    'incorrectWardenFortifies': { label: 'Niepoprawne umocnienia strażnika', color: '#EF4444' },
    'janitorCleans': { label: 'Sprzątanie woźnego', color: '#6366F1' },
    'completedTasks': { label: 'Ukończone zadania', color: '#10B981' },
    'survivedRounds': { label: 'Przeżyte rundy', color: '#F59E0B' },
    'correctAltruistRevives': { label: 'Poprawne wskrzeszenia altruisty', color: '#22C55E' },
    'incorrectAltruistRevives': { label: 'Niepoprawne wskrzeszenia altruisty', color: '#EF4444' },
    'correctSwaps': { label: 'Poprawne zamiany', color: '#22C55E' },
    'incorrectSwaps': { label: 'Niepoprawne zamiany', color: '#EF4444' },
    'totalPoints': { label: 'Łączne punkty', color: '#F59E0B' }
  };

  // Dodaj statystyki tylko jeśli mają wartość większą niż 0
  Object.entries(statLabels).forEach(([key, config]) => {
    const value = player[key as keyof UIPlayerData] as number;
    if (typeof value === 'number' && value > 0) {
      statParts.push({
        text: `${config.label}: ${value}`,
        color: config.color
      });
    }
  });

  // Dodaj procent ukończonych zadań jeśli dostępne
  if (player.completedTasks && maxTasks && maxTasks > 0) {
    const percentage = Math.round((player.completedTasks / maxTasks) * 100);
    statParts.push({
      text: `Zadania: ${player.completedTasks}/${maxTasks} (${percentage}%)`,
      color: percentage >= 80 ? '#22C55E' : percentage >= 50 ? '#F59E0B' : '#EF4444'
    });
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
      const primaryRole = winner.roleHistory.find(role => role.order === 0)?.roleName || '';
      winnerColors[winner.player.name] = getRoleColor(primaryRole);
    });

    return {
      id: game.gameIdentifier,
      date: extractDateFromGameId(game.gameIdentifier),
      gameNumber: 0, // Will be computed after all games are fetched
      duration: formatDuration(game.startTime, game.endTime),
      players: game.gamePlayerStatistics.length,
      winner: game.winnerTeam || 'Unknown',
      winnerColor: getTeamColor(game.winnerTeam || ''),
      winCondition: game.winCondition || 'Unknown',
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
    .sort((a, b) => b.id.localeCompare(a.id));
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
    const primaryRole = winner.roleHistory.find(role => role.order === 0)?.roleName || '';
    winnerColors[winner.player.name] = getRoleColor(primaryRole);
  });

  // Build player stats for detailed UI
  const playersData: UIPlayerData[] = game.gamePlayerStatistics.map(stat => {
    const roleHistory = stat.roleHistory.map(role => role.roleName);
    const primaryRole = roleHistory[0] || 'Unknown';
    const modifiers = stat.modifiers.map(modifier => modifier.modifierName);
    const team = determineTeam(primaryRole);

    return {
      nickname: stat.player.name,
      role: primaryRole,
      roleColor: getRoleColor(primaryRole),
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
        modifiers: stat.modifiers.map(modifier => modifier.modifierName),
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
    winner: game.winnerTeam || 'Unknown',
    winnerColor: getTeamColor(game.winnerTeam || ''),
    winCondition: game.winCondition || 'Unknown',
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
      const roleColor = getRoleColor(primaryRole);
      const team = determineTeam(primaryRole);
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
      // Determine winning team
      const winnerTeams = winners.map(w => w.team);
      const teamCounts = winnerTeams.reduce((acc, team) => {
        acc[team] = (acc[team] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const dominantTeam = Object.entries(teamCounts).sort(([,a], [,b]) => b - a)[0]?.[0];
      
      if (dominantTeam === 'Impostor') {
        winner = 'Impostor';
        winnerColor = getTeamColor(Teams.Impostor);
      } else if (dominantTeam === 'Neutral') {
        winner = 'Neutral';
        winnerColor = getTeamColor(Teams.Neutral);
      } else {
        winner = 'Crewmate';
        winnerColor = getTeamColor(Teams.Crewmate);
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
    const roleColor = getRoleColor(roleName);
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