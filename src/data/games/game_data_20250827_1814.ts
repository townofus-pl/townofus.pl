// Generated game data - 2025-08-27 18:29:44

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
    startTime: "2025-08-27 18:14:05",
    endTime: "2025-08-27 18:29:44",
    duration: "15:39",
    playerCount: 14,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Plumber"],
      modifiers: ["Diseased"],
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
      playerName: "Malkiz",
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
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.8,
    },
    {
      playerName: "GIMPER 2",
      roleHistory: ["Mystic"],
      modifiers: ["Torch"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.9,
    },
    {
      playerName: "Mamika",
      roleHistory: ["Plaguebearer"],
      modifiers: ["Satellite"],
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
      playerName: "Bartek",
      roleHistory: ["Lookout"],
      modifiers: ["Celebrity"],
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
      playerName: "Miras",
      roleHistory: ["Jailor"],
      modifiers: ["Shy"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.4,
    },
    {
      playerName: "DawDu",
      roleHistory: ["Miner"],
      modifiers: ["Underdog", "Giant"],
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
      playerName: "Dziekansqr",
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
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.8,
    },
    {
      playerName: "Nudna",
      roleHistory: ["Aurial"],
      modifiers: ["Multitasker", "Sixth Sense"],
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
      playerName: "Barox24",
      roleHistory: ["Spy"],
      modifiers: ["Aftermath", "Mini"],
      win: 0,
      disconnected: 1,
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 0.0,
    },
    {
      playerName: "brubel",
      roleHistory: ["Grenadier"],
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
      completedTasks: 0,
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.0,
    },
    {
      playerName: "AlerGeek",
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
      totalPoints: 2.2,
    },
    {
      playerName: "Zieloony",
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
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.3,
    },
    {
      playerName: "Subek",
      roleHistory: ["Cleric"],
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
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.6,
    }
  ],
  gameEvents: [
    {
      timestamp: "18:14:16",
      description: "Zieloony (Hunter) got infected",
    },
    {
      timestamp: "18:14:20",
      description: "Malkiz (Glitch) killed brubel (Grenadier) — Correct kill",
    },
    {
      timestamp: "18:14:24",
      description: "AlerGeek (Vampire) got infected",
    },
    {
      timestamp: "18:14:24",
      description: "AlerGeek (Vampire) killed Mamika (Plaguebearer) — Correct kill",
    },
    {
      timestamp: "18:14:26",
      description: "ziomson (Plumber) reported brubel's (Grenadier) body! Meeting started.",
    },
    {
      timestamp: "18:15:35",
      description: "AlerGeek (Vampire) guessed AlerGeek (Vampire) — Incorrect guess",
    },
    {
      timestamp: "18:17:01",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "18:17:22",
      description: "Miras (Jailor) got infected",
    },
    {
      timestamp: "18:17:41",
      description: "Malkiz (Glitch) killed Nudna (Aurial) — Correct kill",
    },
    {
      timestamp: "18:17:56",
      description: "ziomson (Plumber) reported Nudna's (Aurial) body! Meeting started.",
    },
    {
      timestamp: "18:20:46",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "18:21:01",
      description: "Barox24 (Spy) got infected",
    },
    {
      timestamp: "18:21:09",
      description: "ziomson (Plumber) got infected",
    },
    {
      timestamp: "18:21:12",
      description: "Malkiz (Glitch) got infected",
    },
    {
      timestamp: "18:21:12",
      description: "Malkiz (Glitch) killed Zieloony (Hunter) — Correct kill",
    },
    {
      timestamp: "18:21:17",
      description: "DawDu (Miner) got infected",
    },
    {
      timestamp: "18:21:17",
      description: "DawDu (Miner) killed ziomson (Plumber) — Correct kill",
    },
    {
      timestamp: "18:21:22",
      description: "Dziekansqr (Guardian Angel) got infected",
    },
    {
      timestamp: "18:21:32",
      description: "Barox24 (Spy) reported Zieloony's (Hunter) body! Meeting started.",
    },
    {
      timestamp: "18:24:21",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "18:24:40",
      description: "Bartek (Lookout) got infected",
    },
    {
      timestamp: "18:25:10",
      description: "Malkiz (Glitch) killed Bartek (Lookout) — Correct kill",
    },
    {
      timestamp: "18:25:16",
      description: "[18:25:16] Player Barox24 disconnected from the game",
    },
    {
      timestamp: "18:25:22",
      description: "GIMPER 2 (Mystic) got infected",
    },
    {
      timestamp: "18:25:22",
      description: "GIMPER 2 (Mystic) reported Bartek's (Lookout) body! Meeting started.",
    },
    {
      timestamp: "18:28:11",
      description: "Meeting ended. Subek (Cleric) exiled.",
    },
    {
      timestamp: "18:28:33",
      description: "DawDu (Miner) killed Dziekansqr (Guardian Angel) — Correct kill",
    },
    {
      timestamp: "18:28:48",
      description: "DawDu (Miner) killed Malkiz (Glitch) — Correct kill",
    },
    {
      timestamp: "18:28:51",
      description: "GIMPER 2 (Mystic) reported Malkiz's (Glitch) body! Meeting started.",
    },
    {
      timestamp: "18:29:43",
      description: "Meeting ended. Miras (Jailor) exiled.",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "brubel (Grenadier) - Killed by Malkiz (Glitch)"
,        "Mamika (Plaguebearer) - Killed by AlerGeek (Vampire)"
      ],
      votes: {
        "AlerGeek": ["ziomson", "Dziekansqr", "DawDu", "GIMPER 2", "Nudna", "Bartek", "Zieloony", "Subek", "Miras"],
        "Barox24": ["Barox24", "Dziekansqr"],
        "Miras": ["AlerGeek"]
      },
      skipVotes: [
"Zieloony", "DawDu", "Nudna", "ziomson", "Malkiz", "Subek", "Bartek", "Miras", "GIMPER 2"
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
        "Nudna (Aurial) - Killed by Malkiz (Glitch)"
      ],
      votes: {
        "Subek": ["DawDu"],
        "Barox24": ["Barox24"]
      },
      skipVotes: [
"Bartek", "ziomson", "Dziekansqr", "Malkiz", "Subek", "Zieloony", "GIMPER 2"
      ],
      noVotes: [

      ],
      blackmailedPlayers: [

      ],
      jailedPlayers: [
"Zieloony"
      ],
      wasTie: false,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 3,
      deathsSinceLastMeeting: [
        "Zieloony (Hunter) - Killed by Malkiz (Glitch)"
,        "ziomson (Plumber) - Killed by DawDu (Miner)"
      ],
      votes: {
        "Dziekansqr": ["DawDu"],
        "Barox24": ["GIMPER 2"]
      },
      skipVotes: [
"Subek", "Dziekansqr", "Malkiz", "Barox24", "Bartek", "Miras"
      ],
      noVotes: [

      ],
      blackmailedPlayers: [

      ],
      jailedPlayers: [
"Dziekansqr"
      ],
      wasTie: false,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 4,
      deathsSinceLastMeeting: [
        "Bartek (Lookout) - Killed by Malkiz (Glitch)"
      ],
      votes: {
        "Subek": ["Dziekansqr", "Malkiz", "DawDu", "GIMPER 2"],
        "DawDu": ["Miras"]
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
        "Subek (Cleric) - Voted out in Meeting 4"
,        "Dziekansqr (Guardian Angel) - Killed by DawDu (Miner)"
,        "Malkiz (Glitch) - Killed by DawDu (Miner)"
      ],
      votes: {
        "DawDu": ["Miras"],
        "Miras": ["DawDu", "GIMPER 2"]
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
