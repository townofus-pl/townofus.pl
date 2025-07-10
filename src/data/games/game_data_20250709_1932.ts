// Generated game data - 2025-07-09 19:54:34

export interface GameMetadata {
  startTime: string;
  endTime: string;
  duration: string;
  playerCount: number;
  map: string;
  maxTasks?: number;
}

export interface PlayerStats {
  playerName: string;
  roleHistory: string[];
  modifiers: string[];
  win: number;
  disconnected: number;
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
  survivedRounds: number;
  correctAltruistRevives: number;
  incorrectAltruistRevives: number;
  correctSwaps: number;
  incorrectSwaps: number;
  totalPoints: number;
}

export interface GameEvent {
  timestamp: string;
  description: string;
}

export interface MeetingData {
  meetingNumber: number;
  deathsSinceLastMeeting: string[];
  votes: { [playerId: string]: string[] };
  skipVotes: string[];
  noVotes: string[];
  blackmailedPlayers: string[];
  jailedPlayers: string[];
  wasTie: boolean;
  wasBlessed: boolean;
}

export interface GameData {
  metadata: GameMetadata;
  players: PlayerStats[];
  gameEvents: GameEvent[];
  meetings: MeetingData[];
}

export const gameData: GameData = {
  metadata: {
    startTime: "2025-07-09 19:32:50",
    endTime: "2025-07-09 19:54:34",
    duration: "21:43",
    playerCount: 19,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Engineer"],
      modifiers: ["Torch"],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 9,
      survivedRounds: 6,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.9,
    },
    {
      playerName: "Cleopatrie",
      roleHistory: ["Grenadier"],
      modifiers: ["Sixth Sense"],
      win: 0,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 2,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 0,
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 4.0,
    },
    {
      playerName: "Dziekansqr",
      roleHistory: ["Vampire"],
      modifiers: [],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 1,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 0,
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 4.0,
    },
    {
      playerName: "nevs",
      roleHistory: ["Warlock"],
      modifiers: ["Saboteur"],
      win: 0,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 2,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 0,
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 4.0,
    },
    {
      playerName: "Fastovsky",
      roleHistory: ["Seer"],
      modifiers: [],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 9,
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.9,
    },
    {
      playerName: "MokraJola",
      roleHistory: ["Imitator", "Deputy", "Imitator", "Jailor", "Imitator", "Warden", "Imitator", "Warden", "Imitator", "Warden", "Imitator", "Warden"],
      modifiers: [],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 3,
      incorrectWardenFortifies: 1,
      janitorCleans: 0,
      completedTasks: 9,
      survivedRounds: 6,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.9,
    },
    {
      playerName: "Ignorancky",
      roleHistory: ["Glitch"],
      modifiers: [],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 4,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 0,
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.0,
    },
    {
      playerName: "AlerGeek",
      roleHistory: ["Survivor"],
      modifiers: [],
      win: 1,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 0,
      survivedRounds: 6,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.0,
    },
    {
      playerName: "KiwiSpice",
      roleHistory: ["Sheriff"],
      modifiers: ["Satellite", "Lover"],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 0,
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.0,
    },
    {
      playerName: "Bartek",
      roleHistory: ["Plaguebearer"],
      modifiers: [],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 0,
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.0,
    },
    {
      playerName: "Jakubeq",
      roleHistory: ["Deputy"],
      modifiers: ["Multitasker"],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 9,
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.9,
    },
    {
      playerName: "Malkiz",
      roleHistory: ["Swapper"],
      modifiers: ["Aftermath"],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 9,
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.9,
    },
    {
      playerName: "GIMPER 2",
      roleHistory: ["Arsonist"],
      modifiers: ["Lover"],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 0,
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.0,
    },
    {
      playerName: "Miras",
      roleHistory: ["GuardianAngel"],
      modifiers: [],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 0,
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.0,
    },
    {
      playerName: "Mamika",
      roleHistory: ["Amnesiac", "Swapper"],
      modifiers: [],
      win: 1,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 0,
      survivedRounds: 6,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.0,
    },
    {
      playerName: "DawDu",
      roleHistory: ["Cleric", "Vampire"],
      modifiers: [],
      win: 0,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 1,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 1,
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.1,
    },
    {
      playerName: "Orzehh",
      roleHistory: ["Jailor"],
      modifiers: [],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 9,
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.9,
    },
    {
      playerName: "smoqu",
      roleHistory: ["Janitor"],
      modifiers: ["Double Shot", "Immovable"],
      win: 0,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 1,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 0,
      survivedRounds: 6,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.0,
    },
    {
      playerName: "Fearu",
      roleHistory: ["Warden"],
      modifiers: [],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 1,
      janitorCleans: 0,
      completedTasks: 9,
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 5.9,
    }
  ],
  gameEvents: [
    {
      timestamp: "19:33:03",
      description: "Fearu (Warden) INCORRECTLY fortified GIMPER 2 (Arsonist)",
    },
    {
      timestamp: "19:33:03",
      description: "Ignorancky (Glitch) got infected",
    },
    {
      timestamp: "19:33:06",
      description: "nevs (Warlock) killed Malkiz (Swapper) — Correct kill",
    },
    {
      timestamp: "19:33:07",
      description: "Cleopatrie (Grenadier) killed Jakubeq (Deputy) — Correct kill",
    },
    {
      timestamp: "19:33:09",
      description: "DawDu transformed: Cleric > Vampire (vampire bite)",
    },
    {
      timestamp: "19:33:14",
      description: "DawDu (Vampire) got infected",
    },
    {
      timestamp: "19:33:17",
      description: "Mamika transformed: Amnesiac > Swapper (remembered role)",
    },
    {
      timestamp: "19:33:18",
      description: "Mamika (Swapper) reported Malkiz's (Crewmate) body! Meeting started.",
    },
    {
      timestamp: "19:36:07",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "19:36:07",
      description: "MokraJola transformed: Imitator > Deputy (imitated Jakubeq)",
    },
    {
      timestamp: "19:36:20",
      description: "Mamika (Swapper) got infected",
    },
    {
      timestamp: "19:36:27",
      description: "GIMPER 2 (Arsonist) got infected",
    },
    {
      timestamp: "19:36:28",
      description: "Orzehh (Jailor) got infected",
    },
    {
      timestamp: "19:36:28",
      description: "Cleopatrie (Grenadier) killed Fearu (Warden) — Correct kill",
    },
    {
      timestamp: "19:36:30",
      description: "nevs (Warlock) killed Fastovsky (Seer) — Correct kill",
    },
    {
      timestamp: "19:36:36",
      description: "GIMPER 2 (Arsonist) died (lover suicide) - partner must have died",
    },
    {
      timestamp: "19:36:36",
      description: "smoqu (Janitor) killed KiwiSpice (Sheriff) — Correct kill",
    },
    {
      timestamp: "19:36:39",
      description: "Dziekansqr (Vampire) killed Cleopatrie (Grenadier) — Correct kill",
    },
    {
      timestamp: "19:36:39",
      description: "Ignorancky (Glitch) killed Orzehh (Jailor) — Correct kill",
    },
    {
      timestamp: "19:36:39",
      description: "Cleopatrie (Grenadier) got infected",
    },
    {
      timestamp: "19:36:39",
      description: "DawDu (Vampire) killed Cleopatrie (Grenadier) — Correct kill",
    },
    {
      timestamp: "19:36:46",
      description: "MokraJola transformed: Deputy > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "19:36:46",
      description: "Mamika (Swapper) reported Malkiz's (Crewmate) body! Meeting started.",
    },
    {
      timestamp: "19:39:36",
      description: "Meeting ended. nevs (Warlock) exiled.",
    },
    {
      timestamp: "19:39:36",
      description: "MokraJola transformed: Imitator > Jailor (imitated Orzehh)",
    },
    {
      timestamp: "19:40:05",
      description: "Ignorancky (Glitch) killed DawDu (Vampire) — Correct kill",
    },
    {
      timestamp: "19:40:18",
      description: "MokraJola (Jailor) got infected",
    },
    {
      timestamp: "19:40:18",
      description: "MokraJola transformed: Jailor > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "19:40:18",
      description: "MokraJola (Imitator) reported DawDu's (Vampire) body! Meeting started.",
    },
    {
      timestamp: "19:43:05",
      description: "MokraJola transformed: Imitator > Warden (imitated Fearu)",
    },
    {
      timestamp: "19:43:05",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "19:43:08",
      description: "MokraJola (Warden) CORRECTLY fortified Mamika (Swapper)",
    },
    {
      timestamp: "19:43:17",
      description: "Dziekansqr (Vampire) got infected",
    },
    {
      timestamp: "19:43:55",
      description: "Miras (Guardian Angel) got infected",
    },
    {
      timestamp: "19:43:55",
      description: "Ignorancky (Glitch) killed Miras (Guardian Angel) — Correct kill",
    },
    {
      timestamp: "19:44:00",
      description: "MokraJola transformed: Warden > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "19:44:00",
      description: "Dziekansqr (Vampire) reported Miras's (GuardianAngel) body! Meeting started.",
    },
    {
      timestamp: "19:46:49",
      description: "MokraJola transformed: Imitator > Warden (imitated Fearu)",
    },
    {
      timestamp: "19:46:49",
      description: "Meeting ended. Dziekansqr (Vampire) exiled.",
    },
    {
      timestamp: "19:46:56",
      description: "AlerGeek (Survivor) got infected",
    },
    {
      timestamp: "19:46:56",
      description: "MokraJola (Warden) INCORRECTLY fortified AlerGeek (Survivor)",
    },
    {
      timestamp: "19:47:30",
      description: "Ignorancky (Glitch) killed Bartek (Plaguebearer) — Correct kill",
    },
    {
      timestamp: "19:47:36",
      description: "smoqu (Janitor) got infected",
    },
    {
      timestamp: "19:47:37",
      description: "MokraJola transformed: Warden > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "19:47:37",
      description: "smoqu (Janitor) reported Bartek's (Plaguebearer) body! Meeting started.",
    },
    {
      timestamp: "19:50:24",
      description: "MokraJola transformed: Imitator > Warden (imitated Fearu)",
    },
    {
      timestamp: "19:50:24",
      description: "Meeting ended. Ignorancky (Glitch) exiled.",
    },
    {
      timestamp: "19:50:28",
      description: "MokraJola (Warden) CORRECTLY fortified Mamika (Swapper)",
    },
    {
      timestamp: "19:51:11",
      description: "MokraJola transformed: Warden > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "19:51:11",
      description: "AlerGeek (Survivor) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "19:53:36",
      description: "MokraJola transformed: Imitator > Warden (imitated Fearu)",
    },
    {
      timestamp: "19:53:36",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "19:53:39",
      description: "MokraJola (Warden) CORRECTLY fortified Mamika (Swapper)",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "Malkiz (Swapper) - Killed by nevs (Warlock)"
,        "Jakubeq (Deputy) - Killed by Cleopatrie (Grenadier)"
      ],
      votes: {

      },
      skipVotes: [

      ],
      noVotes: [

      ],
      blackmailedPlayers: [

      ],
      jailedPlayers: [

      ],
      wasTie: false,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 2,
      deathsSinceLastMeeting: [
        "Fearu (Warden) - Killed by Cleopatrie (Grenadier)"
,        "Fastovsky (Seer) - Killed by nevs (Warlock)"
,        "GIMPER 2 (Arsonist) - Lover suicide (partner died)"
,        "KiwiSpice (Sheriff) - Killed by smoqu (Janitor)"
,        "Cleopatrie (Grenadier) - Killed by Dziekansqr (Vampire)"
,        "Orzehh (Jailor) - Killed by Ignorancky (Glitch)"
,        "Cleopatrie (Grenadier) - Killed by DawDu (Vampire)"
      ],
      votes: {

      },
      skipVotes: [

      ],
      noVotes: [

      ],
      blackmailedPlayers: [

      ],
      jailedPlayers: [

      ],
      wasTie: false,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 3,
      deathsSinceLastMeeting: [
        "nevs (Warlock) - Voted out in Meeting 2"
,        "DawDu (Vampire) - Killed by Ignorancky (Glitch)"
      ],
      votes: {

      },
      skipVotes: [

      ],
      noVotes: [

      ],
      blackmailedPlayers: [

      ],
      jailedPlayers: [

      ],
      wasTie: false,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 4,
      deathsSinceLastMeeting: [
        "Miras (Guardian Angel) - Killed by Ignorancky (Glitch)"
      ],
      votes: {

      },
      skipVotes: [

      ],
      noVotes: [

      ],
      blackmailedPlayers: [

      ],
      jailedPlayers: [

      ],
      wasTie: false,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 5,
      deathsSinceLastMeeting: [
        "Dziekansqr (Vampire) - Voted out in Meeting 4"
,        "Bartek (Plaguebearer) - Killed by Ignorancky (Glitch)"
      ],
      votes: {

      },
      skipVotes: [

      ],
      noVotes: [

      ],
      blackmailedPlayers: [

      ],
      jailedPlayers: [

      ],
      wasTie: false,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 6,
      deathsSinceLastMeeting: [
        "Ignorancky (Glitch) - Voted out in Meeting 5"
      ],
      votes: {

      },
      skipVotes: [

      ],
      noVotes: [

      ],
      blackmailedPlayers: [

      ],
      jailedPlayers: [

      ],
      wasTie: false,
      wasBlessed: false,
    }
  ],
};
