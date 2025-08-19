// Generated game data - 2025-08-13 19:54:49

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
    startTime: "2025-08-13 19:34:56",
    endTime: "2025-08-13 19:54:49",
    duration: "19:52",
    playerCount: 16,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Jester"],
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
      totalPoints: 9.2,
    },
    {
      playerName: "DawDu",
      roleHistory: ["Arsonist"],
      modifiers: [],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 8,
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
      totalPoints: 12.2,
    },
    {
      playerName: "Cleopatrie",
      roleHistory: ["Veteran"],
      modifiers: ["Diseased", "Sleuth"],
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
      playerName: "Jakubeq",
      roleHistory: ["Transporter"],
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
      completedTasks: 9,
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.3,
    },
    {
      playerName: "Subek",
      roleHistory: ["Blackmailer"],
      modifiers: ["Double Shot", "Lover", "Tiebreaker"],
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
      playerName: "Zieloony",
      roleHistory: ["GuardianAngel"],
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
      survivedRounds: 6,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 4.2,
    },
    {
      playerName: "Budyn",
      roleHistory: ["Detective"],
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
      completedTasks: 4,
      survivedRounds: 6,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.6,
    },
    {
      playerName: "brubel",
      roleHistory: ["Scavenger"],
      modifiers: ["Disperser"],
      win: 0,
      disconnected: 1,
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
      totalPoints: 0.0,
    },
    {
      playerName: "Dziekansqr",
      roleHistory: ["Hunter"],
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
      completedTasks: 9,
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.1,
    },
    {
      playerName: "Miras",
      roleHistory: ["Cleric"],
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
      completedTasks: 9,
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.3,
    },
    {
      playerName: "Bartek",
      roleHistory: ["Amnesiac", "Spy"],
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
      totalPoints: 3.8,
    },
    {
      playerName: "Mamika",
      roleHistory: ["Spy"],
      modifiers: ["Celebrity", "Satellite"],
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
      completedTasks: 6,
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.0,
    },
    {
      playerName: "Nudna",
      roleHistory: ["Trapper"],
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
      completedTasks: 8,
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.8,
    },
    {
      playerName: "QukaVadi",
      roleHistory: ["Investigator"],
      modifiers: ["Bait", "Lover"],
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
      playerName: "Barox24",
      roleHistory: ["Plaguebearer"],
      modifiers: [],
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
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 0.0,
    },
    {
      playerName: "Ignorancky",
      roleHistory: ["Tracker"],
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
      completedTasks: 6,
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.6,
    }
  ],
  gameEvents: [
    {
      timestamp: "19:35:07",
      description: "Ignorancky (Tracker) got infected",
    },
    {
      timestamp: "19:35:08",
      description: "Nudna (Trapper) got infected",
    },
    {
      timestamp: "19:35:16",
      description: "brubel (Scavenger) got infected",
    },
    {
      timestamp: "19:35:16",
      description: "brubel (Scavenger) killed Barox24 (Plaguebearer) — Correct kill",
    },
    {
      timestamp: "19:35:21",
      description: "[19:35:21] Player Barox24 disconnected from the game",
    },
    {
      timestamp: "19:38:34",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "19:38:55",
      description: "Subek (Blackmailer) died (lover suicide) - partner must have died",
    },
    {
      timestamp: "19:38:55",
      description: "DawDu (Arsonist) killed QukaVadi (Investigator) — Correct kill",
    },
    {
      timestamp: "19:38:55",
      description: "DawDu (Arsonist) killed Dziekansqr (Hunter) — Correct kill",
    },
    {
      timestamp: "19:38:56",
      description: "Zieloony (GuardianAngel) reported Subek's (Blackmailer) body! Meeting started.",
    },
    {
      timestamp: "19:39:34",
      description: "[19:39:34] Player brubel disconnected from the game",
    },
    {
      timestamp: "19:41:46",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "19:41:58",
      description: "DawDu (Arsonist) killed Mamika (Spy) — Correct kill",
    },
    {
      timestamp: "19:42:08",
      description: "Bartek transformed: Amnesiac > Spy (remembered role)",
    },
    {
      timestamp: "19:42:11",
      description: "DawDu (Arsonist) killed Jakubeq (Transporter) — Correct kill",
    },
    {
      timestamp: "19:42:11",
      description: "DawDu (Arsonist) killed Miras (Cleric) — Correct kill",
    },
    {
      timestamp: "19:42:15",
      description: "DawDu (Arsonist) reported Jakubeq's (Transporter) body! Meeting started.",
    },
    {
      timestamp: "19:45:04",
      description: "Meeting ended. Cleopatrie (Veteran) exiled.",
    },
    {
      timestamp: "19:45:19",
      description: "ziomson (Jester) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "19:48:05",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "19:48:33",
      description: "DawDu (Arsonist) killed Bartek (Spy) — Correct kill",
    },
    {
      timestamp: "19:48:35",
      description: "DawDu (Arsonist) reported Bartek's (Spy) body! Meeting started.",
    },
    {
      timestamp: "19:51:20",
      description: "Meeting ended. No one exiled (tie).",
    },
    {
      timestamp: "19:52:24",
      description: "DawDu (Arsonist) killed Ignorancky (Tracker) — Correct kill",
    },
    {
      timestamp: "19:52:40",
      description: "DawDu (Arsonist) killed Nudna (Trapper) — Correct kill",
    },
    {
      timestamp: "19:52:41",
      description: "ziomson (Jester) got infected",
    },
    {
      timestamp: "19:52:41",
      description: "ziomson (Jester) reported Ignorancky's (Tracker) body! Meeting started.",
    },
    {
      timestamp: "19:54:48",
      description: "Meeting ended. ziomson (Jester) exiled.",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "Barox24 (Plaguebearer) - Killed by brubel (Scavenger)"
      ],
      votes: {
        "252": ["Dziekansqr"],
        "Bartek": ["Cleopatrie", "Budyn"],
        "Cleopatrie": ["Subek"],
        "Budyn": ["QukaVadi"],
        "brubel": ["Mamika"]
      },
      skipVotes: [
"Bartek", "DawDu", "ziomson", "Miras"
      ],
      noVotes: [

      ],
      blackmailedPlayers: [
"Dziekansqr"
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
        "Subek (Blackmailer) - Lover suicide (partner died)"
,        "QukaVadi (Investigator) - Killed by DawDu (Arsonist)"
,        "Dziekansqr (Hunter) - Killed by DawDu (Arsonist)"
      ],
      votes: {
        "Bartek": ["Cleopatrie", "Budyn"],
        "Miras": ["Mamika"]
      },
      skipVotes: [
"Zieloony", "Miras", "ziomson", "DawDu", "Bartek", "Jakubeq"
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
        "Mamika (Spy) - Killed by DawDu (Arsonist)"
,        "Jakubeq (Transporter) - Killed by DawDu (Arsonist)"
,        "Miras (Cleric) - Killed by DawDu (Arsonist)"
      ],
      votes: {
        "ziomson": ["Cleopatrie"],
        "Bartek": ["Budyn"],
        "Cleopatrie": ["Nudna", "DawDu", "ziomson"]
      },
      skipVotes: [
"Zieloony", "Bartek"
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
        "Cleopatrie (Veteran) - Voted out in Meeting 3"
      ],
      votes: {
        "ziomson": ["ziomson"],
        "Bartek": ["Budyn"],
        "Budyn": ["Nudna", "DawDu"]
      },
      skipVotes: [
"Ignorancky", "Bartek", "Zieloony"
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
        "Bartek (Spy) - Killed by DawDu (Arsonist)"
      ],
      votes: {
        "DawDu": ["Nudna", "Budyn", "Ignorancky"],
        "ziomson": ["ziomson", "Zieloony", "DawDu"]
      },
      skipVotes: [

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
      meetingNumber: 6,
      deathsSinceLastMeeting: [
        "Ignorancky (Tracker) - Killed by DawDu (Arsonist)"
,        "Nudna (Trapper) - Killed by DawDu (Arsonist)"
      ],
      votes: {
        "ziomson": ["Zieloony", "DawDu", "ziomson"],
        "Zieloony": ["Budyn"]
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
