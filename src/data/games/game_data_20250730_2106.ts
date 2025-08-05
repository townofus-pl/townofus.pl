// Generated game data - 2025-07-30 21:20:28

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
    startTime: "2025-07-30 21:06:31",
    endTime: "2025-07-30 21:20:28",
    duration: "13:57",
    playerCount: 15,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Arsonist"],
      modifiers: [],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 1,
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
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 5.0,
    },
    {
      playerName: "DawDu",
      roleHistory: ["Engineer"],
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
      completedTasks: 6,
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.6,
    },
    {
      playerName: "Cleopatrie",
      roleHistory: ["Seer"],
      modifiers: ["Immovable"],
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
      completedTasks: 5,
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.5,
    },
    {
      playerName: "Zieloony",
      roleHistory: ["Vigilante"],
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.8,
    },
    {
      playerName: "Mamika",
      roleHistory: ["Blackmailer"],
      modifiers: ["Disperser"],
      win: 0,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 2,
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
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 5.0,
    },
    {
      playerName: "Bushej",
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
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 4.0,
    },
    {
      playerName: "Barox24",
      roleHistory: ["Altruist"],
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
      completedTasks: 2,
      survivedRounds: 1,
      correctAltruistRevives: 1,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.2,
    },
    {
      playerName: "Budyn",
      roleHistory: ["Warlock"],
      modifiers: [],
      win: 0,
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
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 6.0,
    },
    {
      playerName: "Jakubeq",
      roleHistory: ["Mystic"],
      modifiers: ["Diseased", "Button Barry"],
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
      completedTasks: 4,
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.4,
    },
    {
      playerName: "Dziekansqr",
      roleHistory: ["Imitator", "Altruist", "Imitator", "Seer", "Imitator"],
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
      completedTasks: 4,
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.4,
    },
    {
      playerName: "smoqu",
      roleHistory: ["Plaguebearer"],
      modifiers: ["Shy"],
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
      playerName: "QukaVadi",
      roleHistory: ["Jailor"],
      modifiers: ["Sixth Sense"],
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
      playerName: "Malkiz",
      roleHistory: ["Veteran"],
      modifiers: ["Frosty", "Lover", "Mini"],
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 0.0,
    },
    {
      playerName: "Olivka",
      roleHistory: ["Survivor"],
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.0,
    }
  ],
  gameEvents: [
    {
      timestamp: "21:06:47",
      description: "ziomson (Arsonist) doused Cleopatrie (Seer)",
    },
    {
      timestamp: "21:06:50",
      description: "Mamika (Blackmailer) killed DawDu (Engineer) — Correct kill",
    },
    {
      timestamp: "21:06:52",
      description: "Barox24 (Altruist) revived DawDu (Engineer) — Correct revive",
    },
    {
      timestamp: "21:06:54",
      description: "Barox24 (Altruist) got infected",
    },
    {
      timestamp: "21:06:56",
      description: "Bushej (Vampire) killed brubel (Jester) — Correct kill",
    },
    {
      timestamp: "21:07:04",
      description: "ziomson (Arsonist) doused Bushej (Vampire)",
    },
    {
      timestamp: "21:07:05",
      description: "Jakubeq (Mystic) got infected",
    },
    {
      timestamp: "21:07:10",
      description: "Mamika (Blackmailer) killed QukaVadi (Jailor) — Correct kill",
    },
    {
      timestamp: "21:07:12",
      description: "DawDu (Engineer) reported QukaVadi's (Jailor) body! Meeting started.",
    },
    {
      timestamp: "21:07:27",
      description: "Mamika (Blackmailer) guessed Barox24 (Altruist) — Correct guess",
    },
    {
      timestamp: "21:07:31",
      description: "ziomson (Arsonist) guessed Mamika (Blackmailer) — Correct guess",
    },
    {
      timestamp: "21:10:01",
      description: "Meeting ended. Bushej (Vampire) exiled.",
    },
    {
      timestamp: "21:10:01",
      description: "Dziekansqr transformed: Imitator > Altruist (imitated Barox24)",
    },
    {
      timestamp: "21:10:26",
      description: "ziomson (Arsonist) killed Cleopatrie (Seer) — Correct kill",
    },
    {
      timestamp: "21:10:39",
      description: "Dziekansqr transformed: Altruist > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "21:10:39",
      description: "Malkiz (Veteran) reported Cleopatrie's (Seer) body! Meeting started.",
    },
    {
      timestamp: "21:13:12",
      description: "Meeting ended. ziomson (Arsonist) exiled.",
    },
    {
      timestamp: "21:13:12",
      description: "Dziekansqr transformed: Imitator > Seer (imitated Cleopatrie)",
    },
    {
      timestamp: "21:13:26",
      description: "Dziekansqr (Seer) got infected",
    },
    {
      timestamp: "21:13:39",
      description: "Budyn (Warlock) got infected",
    },
    {
      timestamp: "21:13:50",
      description: "Dziekansqr transformed: Seer > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "21:13:50",
      description: "Dziekansqr (Imitator) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "21:15:28",
      description: "[21:15:28] Player Malkiz disconnected from the game",
    },
    {
      timestamp: "21:16:00",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "21:16:36",
      description: "Zieloony (Vigilante) got infected",
    },
    {
      timestamp: "21:16:55",
      description: "Olivka (Survivor) got infected",
    },
    {
      timestamp: "21:16:55",
      description: "Budyn (Warlock) killed smoqu (Plaguebearer) — Correct kill",
    },
    {
      timestamp: "21:16:55",
      description: "Budyn (Warlock) killed Olivka (Survivor) — Correct kill",
    },
    {
      timestamp: "21:17:39",
      description: "Budyn (Warlock) killed Dziekansqr (Imitator) — Correct kill",
    },
    {
      timestamp: "21:17:39",
      description: "Budyn (Warlock) killed Zieloony (Vigilante) — Correct kill",
    },
    {
      timestamp: "21:17:39",
      description: "DawDu (Engineer) got infected",
    },
    {
      timestamp: "21:17:40",
      description: "DawDu (Engineer) reported Olivka's (Survivor) body! Meeting started.",
    },
    {
      timestamp: "21:20:27",
      description: "Meeting ended. Budyn (Warlock) exiled.",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "DawDu (Engineer) - Killed by Mamika (Blackmailer)"
,        "brubel (Jester) - Killed by Bushej (Vampire)"
,        "QukaVadi (Jailor) - Killed by Mamika (Blackmailer)"
      ],
      votes: {
        "Bushej": ["Budyn", "Dziekansqr", "smoqu", "Zieloony", "ziomson", "Malkiz", "Olivka"],
        "DawDu": ["Jakubeq"]
      },
      skipVotes: [
"Cleopatrie", "Bushej"
      ],
      noVotes: [

      ],
      blackmailedPlayers: [
"DawDu"
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
        "Bushej (Vampire) - Voted out in Meeting 1"
,        "Cleopatrie (Seer) - Killed by ziomson (Arsonist)"
      ],
      votes: {
        "ziomson": ["ziomson", "DawDu", "Olivka", "Malkiz", "Zieloony", "Dziekansqr", "smoqu", "Budyn"]
      },
      skipVotes: [
"Jakubeq"
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
        "ziomson (Arsonist) - Voted out in Meeting 2"
      ],
      votes: {
        "Budyn": ["Dziekansqr", "DawDu", "Olivka"]
      },
      skipVotes: [
"Jakubeq", "Zieloony", "Budyn", "smoqu"
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
        "smoqu (Plaguebearer) - Killed by Budyn (Warlock)"
,        "Olivka (Survivor) - Killed by Budyn (Warlock)"
,        "Dziekansqr (Imitator) - Killed by Budyn (Warlock)"
,        "Zieloony (Vigilante) - Killed by Budyn (Warlock)"
      ],
      votes: {
        "Budyn": ["DawDu", "Jakubeq"],
        "DawDu": ["Budyn"]
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
