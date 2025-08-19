// Generated game data - 2025-08-13 21:33:11

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
    startTime: "2025-08-13 21:20:09",
    endTime: "2025-08-13 21:33:11",
    duration: "13:01",
    playerCount: 12,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Swapper"],
      modifiers: ["Celebrity", "Sleuth"],
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
      totalPoints: 8.9,
    },
    {
      playerName: "DawDu",
      roleHistory: ["Hunter", "Vampire"],
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
      completedTasks: 2,
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 4.0,
    },
    {
      playerName: "Subek",
      roleHistory: ["Transporter"],
      modifiers: ["Giant"],
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
      completedTasks: 7,
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.5,
    },
    {
      playerName: "Cleopatrie",
      roleHistory: ["Altruist"],
      modifiers: ["Bait"],
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
      correctAltruistRevives: 1,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 9.1,
    },
    {
      playerName: "Mamika",
      roleHistory: ["Jailor"],
      modifiers: ["Torch", "Lover", "Shy"],
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
      completedTasks: 6,
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 9.6,
    },
    {
      playerName: "Bartek",
      roleHistory: ["Warlock"],
      modifiers: ["Disperser", "Immovable"],
      win: 0,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 1,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 1,
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
      totalPoints: 1.2,
    },
    {
      playerName: "Budyn",
      roleHistory: ["Doomsayer"],
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
      playerName: "QukaVadi",
      roleHistory: ["Vampire"],
      modifiers: [],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 2,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 1,
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
      playerName: "brubel",
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
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.0,
    },
    {
      playerName: "Miras",
      roleHistory: ["Imitator", "Altruist", "Imitator", "Altruist", "Imitator", "Altruist", "Imitator"],
      modifiers: ["Taskmaster"],
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
      totalPoints: 8.9,
    },
    {
      playerName: "Dziekansqr",
      roleHistory: ["Mystic"],
      modifiers: ["Aftermath", "Lover"],
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
      completedTasks: 5,
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 9.5,
    },
    {
      playerName: "Jakubeq",
      roleHistory: ["Grenadier"],
      modifiers: ["Double Shot"],
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
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.4,
    }
  ],
  gameEvents: [
    {
      timestamp: "21:20:32",
      description: "DawDu transformed: Hunter > Vampire (vampire bite)",
    },
    {
      timestamp: "21:20:42",
      description: "Jakubeq (Grenadier) killed brubel (Jester) — Correct kill",
    },
    {
      timestamp: "21:20:45",
      description: "Mamika (Jailor) died (lover suicide) - partner must have died",
    },
    {
      timestamp: "21:20:45",
      description: "Bartek (Warlock) killed Dziekansqr (Mystic) — Correct kill",
    },
    {
      timestamp: "21:20:47",
      description: "Cleopatrie (Altruist) revived Mamika (Jailor) — Correct revive",
    },
    {
      timestamp: "21:20:53",
      description: "Miras (Imitator) reported brubel's (Jester) body! Meeting started.",
    },
    {
      timestamp: "21:22:24",
      description: "Bartek (Warlock) guessed Bartek (Warlock) — Incorrect guess",
    },
    {
      timestamp: "21:22:49",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "21:23:10",
      description: "DawDu (Vampire) killed Cleopatrie (Altruist) — Correct kill",
    },
    {
      timestamp: "21:23:11",
      description: "DawDu (Vampire) reported Cleopatrie's (Altruist) body! Meeting started.",
    },
    {
      timestamp: "21:25:48",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "21:25:49",
      description: "Miras transformed: Imitator > Altruist (imitated Cleopatrie)",
    },
    {
      timestamp: "21:26:37",
      description: "QukaVadi (Vampire) killed Jakubeq (Grenadier) — Correct kill",
    },
    {
      timestamp: "21:26:40",
      description: "Miras transformed: Altruist > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "21:26:40",
      description: "QukaVadi (Vampire) reported Jakubeq's (Grenadier) body! Meeting started.",
    },
    {
      timestamp: "21:29:29",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "21:29:29",
      description: "Miras transformed: Imitator > Altruist (imitated Cleopatrie)",
    },
    {
      timestamp: "21:30:43",
      description: "Miras transformed: Altruist > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "21:30:43",
      description: "Budyn (Doomsayer) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "21:32:23",
      description: "Meeting ended. DawDu (Vampire) exiled.",
    },
    {
      timestamp: "21:32:23",
      description: "Miras transformed: Imitator > Altruist (imitated Cleopatrie)",
    },
    {
      timestamp: "21:32:40",
      description: "QukaVadi (Vampire) killed Subek (Transporter) — Correct kill",
    },
    {
      timestamp: "21:32:48",
      description: "Miras transformed: Altruist > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "21:32:48",
      description: "Dziekansqr (Mystic) reported Subek's (Transporter) body! Meeting started.",
    },
    {
      timestamp: "21:33:10",
      description: "QukaVadi (Vampire) guessed QukaVadi (Vampire) — Incorrect guess",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "brubel (Jester) - Killed by Jakubeq (Grenadier)"
,        "Mamika (Jailor) - Lover suicide (partner died)"
,        "Dziekansqr (Mystic) - Killed by Bartek (Warlock)"
      ],
      votes: {
        "Bartek": ["Mamika", "ziomson", "Cleopatrie", "Dziekansqr", "Jakubeq", "Budyn", "Miras"],
        "Cleopatrie": ["QukaVadi", "Budyn"],
        "QukaVadi": ["Dziekansqr"]
      },
      skipVotes: [
"Subek", "DawDu", "Cleopatrie", "Mamika", "Miras", "Jakubeq", "ziomson"
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
        "Cleopatrie (Altruist) - Killed by DawDu (Vampire)"
      ],
      votes: {
        "DawDu": ["Dziekansqr"]
      },
      skipVotes: [
"Subek", "DawDu", "Budyn", "Mamika", "Jakubeq", "ziomson", "Miras", "QukaVadi"
      ],
      noVotes: [

      ],
      blackmailedPlayers: [

      ],
      jailedPlayers: [
"QukaVadi"
      ],
      wasTie: false,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 3,
      deathsSinceLastMeeting: [
        "Jakubeq (Grenadier) - Killed by QukaVadi (Vampire)"
      ],
      votes: {
        "DawDu": ["Dziekansqr", "ziomson", "Miras"],
        "Miras": ["QukaVadi"]
      },
      skipVotes: [
"Subek", "Mamika", "DawDu", "Budyn"
      ],
      noVotes: [

      ],
      blackmailedPlayers: [

      ],
      jailedPlayers: [
"Budyn"
      ],
      wasTie: false,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 4,
      deathsSinceLastMeeting: [
      ],
      votes: {
        "DawDu": ["Dziekansqr", "ziomson", "Subek", "QukaVadi", "Mamika", "Budyn", "Miras"]
      },
      skipVotes: [
"DawDu"
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
