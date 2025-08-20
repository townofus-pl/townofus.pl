// Generated game data - 2025-08-20 20:59:52

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
    startTime: "2025-08-20 20:52:59",
    endTime: "2025-08-20 20:59:52",
    duration: "06:53",
    playerCount: 10,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Lookout"],
      modifiers: ["Bait", "Tiebreaker"],
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
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.0,
    },
    {
      playerName: "Cleopatrie",
      roleHistory: ["Imitator"],
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
      playerName: "Subek",
      roleHistory: ["Venerer"],
      modifiers: ["Underdog", "Button Barry"],
      win: 0,
      disconnected: 0,
      initialRolePoints: 2,
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
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.2,
    },
    {
      playerName: "QukaVadi",
      roleHistory: ["Swapper"],
      modifiers: ["Torch", "Mini"],
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
      completedTasks: 3,
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.9,
    },
    {
      playerName: "Arbuzix",
      roleHistory: ["Seer"],
      modifiers: ["Diseased"],
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
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.6,
    },
    {
      playerName: "Miras",
      roleHistory: ["Sheriff"],
      modifiers: ["Flash"],
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
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.9,
    },
    {
      playerName: "brubel",
      roleHistory: ["Plaguebearer", "Pestilence"],
      modifiers: [],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 6.6,
    },
    {
      playerName: "Ph4",
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
      completedTasks: 5,
      survivedRounds: 3,
      correctAltruistRevives: 2,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 10.1,
    },
    {
      playerName: "DawDu",
      roleHistory: ["Plumber"],
      modifiers: ["Taskmaster", "Satellite"],
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.3,
    },
    {
      playerName: "Malkiz",
      roleHistory: ["Spy"],
      modifiers: ["Multitasker", "Immovable"],
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.1,
    }
  ],
  gameEvents: [
    {
      timestamp: "20:53:10",
      description: "Ph4 (Altruist) got infected",
    },
    {
      timestamp: "20:53:11",
      description: "Subek (Venerer) killed Malkiz (Spy) — Correct kill",
    },
    {
      timestamp: "20:53:21",
      description: "Subek (Venerer) killed QukaVadi (Swapper) — Correct kill",
    },
    {
      timestamp: "20:53:37",
      description: "Ph4 (Altruist) revived QukaVadi (Swapper) — Correct revive",
    },
    {
      timestamp: "20:53:37",
      description: "Ph4 (Altruist) revived Malkiz (Spy) — Correct revive",
    },
    {
      timestamp: "20:53:38",
      description: "Subek (Venerer) killed Cleopatrie (Imitator) — Correct kill",
    },
    {
      timestamp: "20:53:44",
      description: "Arbuzix (Seer) reported Cleopatrie's (Imitator) body! Meeting started.",
    },
    {
      timestamp: "20:53:52",
      description: "Subek (Venerer) guessed Subek (Venerer) — Incorrect guess",
    },
    {
      timestamp: "20:54:46",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:54:58",
      description: "ziomson (Lookout) got infected",
    },
    {
      timestamp: "20:55:05",
      description: "QukaVadi (Swapper) got infected",
    },
    {
      timestamp: "20:55:17",
      description: "Arbuzix (Seer) got infected",
    },
    {
      timestamp: "20:55:36",
      description: "DawDu (Plumber) got infected",
    },
    {
      timestamp: "20:55:57",
      description: "Miras (Sheriff) got infected",
    },
    {
      timestamp: "20:55:58",
      description: "Arbuzix (Seer) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "20:58:25",
      description: "brubel (Plaguebearer) guessed Arbuzix (Seer) — Correct guess",
    },
    {
      timestamp: "20:58:43",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:58:55",
      description: "Malkiz (Spy) got infected",
    },
    {
      timestamp: "20:58:55",
      description: "brubel transformed: Plaguebearer > Pestilence (infected all living players)",
    },
    {
      timestamp: "20:59:00",
      description: "brubel (Pestilence) killed Miras (Sheriff) — Correct kill",
    },
    {
      timestamp: "20:59:06",
      description: "brubel (Pestilence) killed ziomson (Lookout) — Correct kill",
    },
    {
      timestamp: "20:59:09",
      description: "brubel (Pestilence) reported ziomson's (Lookout) body! Meeting started.",
    },
    {
      timestamp: "20:59:51",
      description: "Meeting ended. brubel (Pestilence) exiled.",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "Malkiz (Spy) - Killed by Subek (Venerer)"
,        "QukaVadi (Swapper) - Killed by Subek (Venerer)"
,        "Cleopatrie (Imitator) - Killed by Subek (Venerer)"
      ],
      votes: {

      },
      skipVotes: [
"DawDu", "ziomson", "Arbuzix", "brubel", "Miras", "Ph4", "Malkiz", "QukaVadi"
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
      ],
      votes: {
        "brubel": ["Arbuzix", "ziomson", "QukaVadi", "Ph4"]
      },
      skipVotes: [
"DawDu", "brubel", "Miras", "Malkiz"
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
        "Miras (Sheriff) - Killed by brubel (Pestilence)"
,        "ziomson (Lookout) - Killed by brubel (Pestilence)"
      ],
      votes: {
        "brubel": ["Ph4", "DawDu", "Malkiz", "QukaVadi"]
      },
      skipVotes: [
"brubel"
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
