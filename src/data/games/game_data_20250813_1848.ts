// Generated game data - 2025-08-13 19:05:19

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
    startTime: "2025-08-13 18:48:27",
    endTime: "2025-08-13 19:05:19",
    duration: "16:52",
    playerCount: 17,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Glitch"],
      modifiers: [],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 5,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 1,
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
      totalPoints: 10.0,
    },
    {
      playerName: "DawDu",
      roleHistory: ["Seer"],
      modifiers: [],
      win: 0,
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
      completedTasks: 7,
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.1,
    },
    {
      playerName: "Cleopatrie",
      roleHistory: ["Executioner"],
      modifiers: ["Giant"],
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
      playerName: "Barox24",
      roleHistory: ["Sheriff"],
      modifiers: [],
      win: 0,
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
      completedTasks: 5,
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.1,
    },
    {
      playerName: "Mamika",
      roleHistory: ["Investigator"],
      modifiers: ["Multitasker", "Radar"],
      win: 0,
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
      completedTasks: 7,
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.5,
    },
    {
      playerName: "Jakubeq",
      roleHistory: ["Warden"],
      modifiers: ["Bait"],
      win: 0,
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
      correctWardenFortifies: 1,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 5,
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 4.5,
    },
    {
      playerName: "Zieloony",
      roleHistory: ["SoulCollector"],
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
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.2,
    },
    {
      playerName: "Subek",
      roleHistory: ["Swapper"],
      modifiers: ["Sixth Sense"],
      win: 0,
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.5,
    },
    {
      playerName: "Ignorancky",
      roleHistory: ["Bomber"],
      modifiers: [],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
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
      totalPoints: 12.0,
    },
    {
      playerName: "Bartek",
      roleHistory: ["Engineer"],
      modifiers: ["Aftermath"],
      win: 0,
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
      totalPoints: 2.9,
    },
    {
      playerName: "QukaVadi",
      roleHistory: ["Scavenger"],
      modifiers: ["Disperser"],
      win: 1,
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 11.0,
    },
    {
      playerName: "Budyn",
      roleHistory: ["Aurial"],
      modifiers: ["Lover", "Mini"],
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
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.4,
    },
    {
      playerName: "Dziekansqr",
      roleHistory: ["Imitator", "Engineer", "Imitator", "Engineer", "Imitator", "Engineer", "Imitator", "Engineer", "Imitator"],
      modifiers: [],
      win: 0,
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
      completedTasks: 7,
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.7,
    },
    {
      playerName: "brubel",
      roleHistory: ["Mystic"],
      modifiers: ["Frosty"],
      win: 0,
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.5,
    },
    {
      playerName: "Orzehh",
      roleHistory: ["Jester"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 4.0,
    },
    {
      playerName: "Nudna",
      roleHistory: ["Grenadier"],
      modifiers: ["Double Shot"],
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.6,
    },
    {
      playerName: "KiwiSpice",
      roleHistory: ["Juggernaut"],
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
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 4.4,
    }
  ],
  gameEvents: [
    {
      timestamp: "18:48:41",
      description: "Ignorancky (Bomber) killed Cleopatrie (Executioner) — Correct kill",
    },
    {
      timestamp: "18:48:44",
      description: "ziomson (Glitch) killed Bartek (Engineer) — Correct kill",
    },
    {
      timestamp: "18:48:46",
      description: "DawDu (Seer) reported Cleopatrie's (Executioner) body! Meeting started.",
    },
    {
      timestamp: "18:51:35",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "18:51:35",
      description: "Dziekansqr transformed: Imitator > Engineer (imitated Bartek)",
    },
    {
      timestamp: "18:52:03",
      description: "ziomson (Glitch) killed Zieloony (Soul Collector) — Correct kill",
    },
    {
      timestamp: "18:52:14",
      description: "Dziekansqr transformed: Engineer > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "18:52:14",
      description: "Ignorancky (Bomber) reported Zieloony's (SoulCollector) body! Meeting started.",
    },
    {
      timestamp: "18:55:03",
      description: "Meeting ended. No one exiled (tie).",
    },
    {
      timestamp: "18:55:04",
      description: "Dziekansqr transformed: Imitator > Engineer (imitated Bartek)",
    },
    {
      timestamp: "18:55:25",
      description: "KiwiSpice (Juggernaut) died (lover suicide) - partner must have died",
    },
    {
      timestamp: "18:55:25",
      description: "QukaVadi (Scavenger) killed Budyn (Aurial) — Correct kill",
    },
    {
      timestamp: "18:55:32",
      description: "ziomson (Glitch) killed DawDu (Seer) — Correct kill",
    },
    {
      timestamp: "18:55:34",
      description: "Dziekansqr transformed: Engineer > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "18:55:34",
      description: "Dziekansqr (Imitator) reported KiwiSpice's (Juggernaut) body! Meeting started.",
    },
    {
      timestamp: "18:58:00",
      description: "ziomson (Glitch) guessed Nudna (Grenadier) — Correct guess",
    },
    {
      timestamp: "18:58:23",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "18:58:24",
      description: "Dziekansqr transformed: Imitator > Engineer (imitated Bartek)",
    },
    {
      timestamp: "18:58:42",
      description: "ziomson (Glitch) killed Subek (Swapper) — Correct kill",
    },
    {
      timestamp: "18:58:47",
      description: "Ignorancky (Bomber) killed Barox24 (Sheriff) — Correct kill",
    },
    {
      timestamp: "18:58:47",
      description: "Ignorancky (Bomber) killed brubel (Mystic) — Correct kill",
    },
    {
      timestamp: "18:58:53",
      description: "Dziekansqr transformed: Engineer > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "18:58:53",
      description: "Dziekansqr (Imitator) reported Barox24's (Sheriff) body! Meeting started.",
    },
    {
      timestamp: "19:01:39",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "19:01:39",
      description: "Dziekansqr transformed: Imitator > Engineer (imitated Bartek)",
    },
    {
      timestamp: "19:01:44",
      description: "Jakubeq (Warden) CORRECTLY fortified Dziekansqr (Engineer)",
    },
    {
      timestamp: "19:02:00",
      description: "QukaVadi (Scavenger) killed Mamika (Investigator) — Correct kill",
    },
    {
      timestamp: "19:02:00",
      description: "Dziekansqr transformed: Engineer > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "19:02:00",
      description: "Dziekansqr (Imitator) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "19:04:50",
      description: "Meeting ended. Dziekansqr (Imitator) exiled.",
    },
    {
      timestamp: "19:05:15",
      description: "ziomson (Glitch) killed QukaVadi (Scavenger) — Correct kill",
    },
    {
      timestamp: "19:05:15",
      description: "QukaVadi (Scavenger) killed ziomson (Glitch) — Correct kill",
    },
    {
      timestamp: "19:05:18",
      description: "Ignorancky (Bomber) killed Jakubeq (Warden) — Correct kill",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "Cleopatrie (Executioner) - Killed by Ignorancky (Bomber)"
,        "Bartek (Engineer) - Killed by ziomson (Glitch)"
      ],
      votes: {
        "Barox24": ["brubel", "Budyn", "QukaVadi"]
      },
      skipVotes: [
"Dziekansqr", "ziomson", "Mamika", "KiwiSpice", "Subek", "Orzehh", "Ignorancky", "Barox24", "DawDu", "Nudna", "Zieloony"
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
        "Zieloony (Soul Collector) - Killed by ziomson (Glitch)"
      ],
      votes: {
        "ziomson": ["DawDu", "QukaVadi", "Ignorancky", "Jakubeq"],
        "Barox24": ["KiwiSpice", "ziomson", "brubel", "Budyn"],
        "brubel": ["Barox24"]
      },
      skipVotes: [
"Mamika", "Orzehh", "Dziekansqr", "Subek"
      ],
      noVotes: [

      ],
      blackmailedPlayers: [

      ],
      jailedPlayers: [

      ],
      wasTie: true,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 3,
      deathsSinceLastMeeting: [
        "KiwiSpice (Juggernaut) - Lover suicide (partner died)"
,        "Budyn (Aurial) - Killed by QukaVadi (Scavenger)"
,        "DawDu (Seer) - Killed by ziomson (Glitch)"
      ],
      votes: {
        "Barox24": ["brubel", "Ignorancky", "QukaVadi"]
      },
      skipVotes: [
"Orzehh", "Dziekansqr", "Mamika", "Subek", "ziomson", "Barox24"
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
        "Subek (Swapper) - Killed by ziomson (Glitch)"
,        "Barox24 (Sheriff) - Killed by Ignorancky (Bomber)"
,        "brubel (Mystic) - Killed by Ignorancky (Bomber)"
      ],
      votes: {
        "QukaVadi": ["Dziekansqr"],
        "Jakubeq": ["QukaVadi"],
        "ziomson": ["Orzehh"]
      },
      skipVotes: [
"Mamika", "Ignorancky", "Jakubeq", "ziomson"
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
        "Mamika (Investigator) - Killed by QukaVadi (Scavenger)"
      ],
      votes: {
        "QukaVadi": ["Dziekansqr"],
        "Dziekansqr": ["Ignorancky", "QukaVadi", "ziomson"],
        "Ignorancky": ["Orzehh"]
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
