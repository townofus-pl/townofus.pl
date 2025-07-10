// Generated game data - 2025-07-09 20:14:39

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
    startTime: "2025-07-09 19:57:18",
    endTime: "2025-07-09 20:14:39",
    duration: "17:20",
    playerCount: 19,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Investigator"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.9,
    },
    {
      playerName: "Cleopatrie",
      roleHistory: ["GuardianAngel"],
      modifiers: ["Shy", "Lover"],
      win: 0,
      disconnected: 0,
      initialRolePoints: 4,
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
      totalPoints: 4.0,
    },
    {
      playerName: "MokraJola",
      roleHistory: ["Arsonist"],
      modifiers: ["Sleuth"],
      win: 0,
      disconnected: 1,
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
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 0.0,
    },
    {
      playerName: "KiwiSpice",
      roleHistory: ["Jester"],
      modifiers: ["Lover"],
      win: 0,
      disconnected: 0,
      initialRolePoints: 4,
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
      totalPoints: 4.0,
    },
    {
      playerName: "Jakubeq",
      roleHistory: ["Vampire"],
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
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.0,
    },
    {
      playerName: "Orzehh",
      roleHistory: ["Scavenger"],
      modifiers: ["Underdog", "Radar"],
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
      playerName: "AlerGeek",
      roleHistory: ["Swapper"],
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
      completedTasks: 8,
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.8,
    },
    {
      playerName: "Dziekansqr",
      roleHistory: ["Jailor"],
      modifiers: ["Mini"],
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
      correctJailorExecutes: 1,
      incorrectJailorExecutes: 1,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 9,
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 6.9,
    },
    {
      playerName: "Bartek",
      roleHistory: ["Venerer"],
      modifiers: ["Double Shot"],
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
      playerName: "Fastovsky",
      roleHistory: ["Detective"],
      modifiers: ["Button Barry"],
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
      roleHistory: ["Prosecutor"],
      modifiers: [],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 1,
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.9,
    },
    {
      playerName: "Miras",
      roleHistory: ["Hunter"],
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
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.9,
    },
    {
      playerName: "Fearu",
      roleHistory: ["Janitor"],
      modifiers: ["Saboteur"],
      win: 0,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 3,
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
      totalPoints: 5.0,
    },
    {
      playerName: "Ignorancky",
      roleHistory: ["Survivor"],
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
      playerName: "DawDu",
      roleHistory: ["Spy"],
      modifiers: ["Satellite"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.9,
    },
    {
      playerName: "Mamika",
      roleHistory: ["Tracker"],
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
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.9,
    },
    {
      playerName: "smoqu",
      roleHistory: ["Lookout"],
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
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.9,
    },
    {
      playerName: "GIMPER 2",
      roleHistory: ["Plaguebearer", "Pestilence"],
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
      playerName: "Dusia",
      roleHistory: ["Aurial"],
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
    }
  ],
  gameEvents: [
    {
      timestamp: "19:57:28",
      description: "AlerGeek (Swapper) got infected",
    },
    {
      timestamp: "19:57:34",
      description: "Bartek (Venerer) killed Mamika (Tracker) — Correct kill",
    },
    {
      timestamp: "19:57:36",
      description: "Orzehh (Scavenger) killed Jakubeq (Vampire) — Correct kill",
    },
    {
      timestamp: "19:57:38",
      description: "Fearu (Janitor) killed Fastovsky (Detective) — Correct kill",
    },
    {
      timestamp: "19:57:53",
      description: "Ignorancky (Survivor) got infected",
    },
    {
      timestamp: "19:57:57",
      description: "Bartek (Venerer) killed Miras (Hunter) — Correct kill",
    },
    {
      timestamp: "20:00:49",
      description: "Malkiz (Prosecutor) prosecuted Bartek (Venerer) — Correct prosecute",
    },
    {
      timestamp: "20:00:49",
      description: "Meeting ended. Bartek (Venerer) exiled.",
    },
    {
      timestamp: "20:00:49",
      description: "AlerGeek (Swapper) swapped votes between Orzehh (Scavenger) and ziomson (Investigator)",
    },
    {
      timestamp: "20:01:00",
      description: "Orzehh (Scavenger) got infected",
    },
    {
      timestamp: "20:01:16",
      description: "Cleopatrie (Guardian Angel) got infected",
    },
    {
      timestamp: "20:01:27",
      description: "KiwiSpice (Jester) got infected",
    },
    {
      timestamp: "20:01:49",
      description: "MokraJola (Arsonist) got infected",
    },
    {
      timestamp: "20:01:50",
      description: "Cleopatrie (Guardian Angel) died (lover suicide) - partner must have died",
    },
    {
      timestamp: "20:01:50",
      description: "Orzehh (Scavenger) killed KiwiSpice (Jester) — Correct kill",
    },
    {
      timestamp: "20:01:52",
      description: "Dziekansqr (Jailor) got infected",
    },
    {
      timestamp: "20:02:00",
      description: "Fearu (Janitor) killed Dusia (Aurial) — Correct kill",
    },
    {
      timestamp: "20:02:01",
      description: "smoqu (Lookout) reported Dusia's (Aurial) body! Meeting started.",
    },
    {
      timestamp: "20:02:09",
      description: "Dziekansqr (Jailor) CORRECTLY executed Orzehh",
    },
    {
      timestamp: "20:04:34",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:04:44",
      description: "DawDu (Spy) got infected",
    },
    {
      timestamp: "20:04:54",
      description: "Malkiz (Prosecutor) got infected",
    },
    {
      timestamp: "20:04:55",
      description: "ziomson (Investigator) got infected",
    },
    {
      timestamp: "20:05:15",
      description: "smoqu (Lookout) got infected",
    },
    {
      timestamp: "20:05:15",
      description: "Fearu (Janitor) got infected",
    },
    {
      timestamp: "20:05:15",
      description: "Fearu (Janitor) killed MokraJola (Arsonist) — Correct kill",
    },
    {
      timestamp: "20:05:15",
      description: "GIMPER 2 transformed: Plaguebearer > Pestilence (infected all living players)",
    },
    {
      timestamp: "20:05:25",
      description: "GIMPER 2 (Pestilence) killed Fearu (Janitor) — Correct kill",
    },
    {
      timestamp: "20:05:37",
      description: "smoqu (Lookout) reported Dusia's (Aurial) body! Meeting started.",
    },
    {
      timestamp: "20:05:45",
      description: "Dziekansqr (Jailor) INCORRECTLY executed Malkiz - loses jail ability",
    },
    {
      timestamp: "20:08:09",
      description: "[20:08:09] Player MokraJola disconnected from the game",
    },
    {
      timestamp: "20:08:26",
      description: "Meeting ended. No one exiled (tie).",
    },
    {
      timestamp: "20:08:26",
      description: "AlerGeek (Swapper) swapped votes between ziomson (Investigator) and AlerGeek (Swapper)",
    },
    {
      timestamp: "20:08:47",
      description: "DawDu (Spy) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "20:11:02",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:12:00",
      description: "GIMPER 2 (Pestilence) killed smoqu (Lookout) — Correct kill",
    },
    {
      timestamp: "20:12:10",
      description: "GIMPER 2 (Pestilence) killed AlerGeek (Swapper) — Correct kill",
    },
    {
      timestamp: "20:12:36",
      description: "GIMPER 2 (Pestilence) killed Ignorancky (Survivor) — Correct kill",
    },
    {
      timestamp: "20:12:46",
      description: "DawDu (Spy) reported AlerGeek's (Swapper) body! Meeting started.",
    },
    {
      timestamp: "20:14:38",
      description: "Meeting ended. GIMPER 2 (Pestilence) exiled.",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "Mamika (Tracker) - Killed by Bartek (Venerer)"
,        "Jakubeq (Vampire) - Killed by Orzehh (Scavenger)"
,        "Fastovsky (Detective) - Killed by Fearu (Janitor)"
,        "Miras (Hunter) - Killed by Bartek (Venerer)"
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
        "Bartek (Venerer) - Voted out in Meeting 1"
,        "Cleopatrie (Guardian Angel) - Lover suicide (partner died)"
,        "KiwiSpice (Jester) - Killed by Orzehh (Scavenger)"
,        "Dusia (Aurial) - Killed by Fearu (Janitor)"
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
"Orzehh"
      ],
      wasTie: false,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 3,
      deathsSinceLastMeeting: [
        "MokraJola (Arsonist) - Killed by Fearu (Janitor)"
,        "Fearu (Janitor) - Killed by GIMPER 2 (Pestilence)"
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
"Malkiz"
      ],
      wasTie: true,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 4,
      deathsSinceLastMeeting: [
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
        "smoqu (Lookout) - Killed by GIMPER 2 (Pestilence)"
,        "AlerGeek (Swapper) - Killed by GIMPER 2 (Pestilence)"
,        "Ignorancky (Survivor) - Killed by GIMPER 2 (Pestilence)"
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
