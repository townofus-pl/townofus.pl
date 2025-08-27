// Generated game data - 2025-08-27 21:53:40

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
    startTime: "2025-08-27 21:38:18",
    endTime: "2025-08-27 21:53:40",
    duration: "15:21",
    playerCount: 12,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Seer", "Vampire"],
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
      completedTasks: 3,
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.1,
    },
    {
      playerName: "DawDu",
      roleHistory: ["Prosecutor"],
      modifiers: ["Multitasker"],
      win: 0,
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
      completedTasks: 6,
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 4.2,
    },
    {
      playerName: "GIMPER 2",
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 4.6,
    },
    {
      playerName: "Subek",
      roleHistory: ["Morphling"],
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
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.2,
    },
    {
      playerName: "Jakubeq",
      roleHistory: ["Escapist"],
      modifiers: ["Underdog"],
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
      completedTasks: 0,
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.8,
    },
    {
      playerName: "brubel",
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
      playerName: "Barox24",
      roleHistory: ["Amnesiac"],
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
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.2,
    },
    {
      playerName: "Miras",
      roleHistory: ["Veteran"],
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
      completedTasks: 3,
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.7,
    },
    {
      playerName: "Bartek",
      roleHistory: ["Medic"],
      modifiers: ["Torch", "Mini", "Lover"],
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
      correctMedicShields: 1,
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
      playerName: "Dziekansqr",
      roleHistory: ["Warden"],
      modifiers: ["Lover"],
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
      correctWardenFortifies: 1,
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
      playerName: "Mamika",
      roleHistory: ["Glitch"],
      modifiers: ["Immovable"],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 3,
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
      totalPoints: 5.0,
    },
    {
      playerName: "Malkiz",
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
      completedTasks: 8,
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.8,
    }
  ],
  gameEvents: [
    {
      timestamp: "21:38:27",
      description: "Dziekansqr (Warden) CORRECTLY fortified Bartek (Medic)",
    },
    {
      timestamp: "21:38:28",
      description: "Bartek (Medic) CORRECTLY shielded Dziekansqr (Warden)",
    },
    {
      timestamp: "21:38:36",
      description: "Subek (Morphling) killed Malkiz (Tracker) — Correct kill",
    },
    {
      timestamp: "21:38:37",
      description: "Barox24 (Amnesiac) reported Malkiz's (Tracker) body! Meeting started.",
    },
    {
      timestamp: "21:40:45",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "21:40:58",
      description: "ziomson transformed: Seer > Vampire (vampire bite)",
    },
    {
      timestamp: "21:41:09",
      description: "Mamika (Glitch) killed Barox24 (Amnesiac) — Correct kill",
    },
    {
      timestamp: "21:41:11",
      description: "Miras (Veteran) killed Subek (Morphling) — Correct kill",
    },
    {
      timestamp: "21:41:15",
      description: "Miras (Veteran) reported Barox24's (Amnesiac) body! Meeting started.",
    },
    {
      timestamp: "21:44:04",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "21:44:20",
      description: "GIMPER 2 (Vampire) killed Miras (Veteran) — Correct kill",
    },
    {
      timestamp: "21:44:23",
      description: "GIMPER 2 (Vampire) reported Miras's (Veteran) body! Meeting started.",
    },
    {
      timestamp: "21:47:09",
      description: "DawDu (Prosecutor) prosecuted GIMPER 2 (Vampire) — Correct prosecute",
    },
    {
      timestamp: "21:47:09",
      description: "Meeting ended. GIMPER 2 (Vampire) exiled.",
    },
    {
      timestamp: "21:47:29",
      description: "Mamika (Glitch) killed DawDu (Prosecutor) — Correct kill",
    },
    {
      timestamp: "21:47:40",
      description: "ziomson (Vampire) reported DawDu's (Prosecutor) body! Meeting started.",
    },
    {
      timestamp: "21:50:29",
      description: "Meeting ended. ziomson (Vampire) exiled.",
    },
    {
      timestamp: "21:50:55",
      description: "Mamika (Glitch) killed Jakubeq (Escapist) — Correct kill",
    },
    {
      timestamp: "21:51:04",
      description: "brubel (Doomsayer) reported Jakubeq's (Escapist) body! Meeting started.",
    },
    {
      timestamp: "21:53:39",
      description: "Mamika (Glitch) guessed Mamika (Glitch) — Incorrect guess",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "Malkiz (Tracker) - Killed by Subek (Morphling)"
      ],
      votes: {
        "GIMPER 2": ["Barox24", "Dziekansqr", "Jakubeq"],
        "Barox24": ["brubel"]
      },
      skipVotes: [
"Mamika", "Bartek", "Subek", "ziomson", "GIMPER 2", "Miras", "DawDu"
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
        "Barox24 (Amnesiac) - Killed by Mamika (Glitch)"
,        "Subek (Morphling) - Killed by Miras (Veteran)"
      ],
      votes: {
        "GIMPER 2": ["brubel", "Dziekansqr", "Bartek"],
        "Mamika": ["GIMPER 2"]
      },
      skipVotes: [
"Jakubeq", "Miras", "DawDu", "ziomson"
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
        "Miras (Veteran) - Killed by GIMPER 2 (Vampire)"
      ],
      votes: {
        "GIMPER 2": ["Bartek", "Dziekansqr", "brubel", "DawDu", "Jakubeq", "ziomson"],
        "brubel": ["GIMPER 2"]
      },
      skipVotes: [
"Mamika"
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
        "GIMPER 2 (Vampire) - Voted out in Meeting 3"
,        "DawDu (Prosecutor) - Killed by Mamika (Glitch)"
      ],
      votes: {
        "ziomson": ["Bartek", "Dziekansqr", "brubel", "Mamika", "Jakubeq"]
      },
      skipVotes: [
"ziomson"
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
