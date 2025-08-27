// Generated game data - 2025-08-27 21:01:29

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
    startTime: "2025-08-27 20:38:03",
    endTime: "2025-08-27 21:01:29",
    duration: "23:25",
    playerCount: 14,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Deputy"],
      modifiers: ["Multitasker", "Lover"],
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
      survivedRounds: 7,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 9.4,
    },
    {
      playerName: "brubel",
      roleHistory: ["Engineer"],
      modifiers: ["Diseased", "Sleuth"],
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
      survivedRounds: 7,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 9.3,
    },
    {
      playerName: "Bartek",
      roleHistory: ["Investigator"],
      modifiers: ["Celebrity"],
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
      survivedRounds: 7,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 9.3,
    },
    {
      playerName: "AlerGeek",
      roleHistory: ["Snitch"],
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
      completedTasks: 9,
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.1,
    },
    {
      playerName: "Dziekansqr",
      roleHistory: ["Executioner"],
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
      playerName: "Jakubeq",
      roleHistory: ["Lookout"],
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
      completedTasks: 8,
      survivedRounds: 6,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 9.0,
    },
    {
      playerName: "Mamika",
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
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.0,
    },
    {
      playerName: "Bushej",
      roleHistory: ["Doomsayer"],
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
      survivedRounds: 7,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 5.4,
    },
    {
      playerName: "Miras",
      roleHistory: ["Plaguebearer", "Pestilence"],
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
      survivedRounds: 7,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 6.4,
    },
    {
      playerName: "Subek",
      roleHistory: ["Blackmailer"],
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
      survivedRounds: 6,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 5.2,
    },
    {
      playerName: "GIMPER 2",
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
      survivedRounds: 7,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 10.3,
    },
    {
      playerName: "Zieloony",
      roleHistory: ["Jailor"],
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
      survivedRounds: 7,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 9.3,
    },
    {
      playerName: "Nudna",
      roleHistory: ["Imitator", "Snitch", "Imitator"],
      modifiers: ["Taskmaster", "Radar"],
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
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.3,
    },
    {
      playerName: "Malkiz",
      roleHistory: ["Morphling"],
      modifiers: ["Disperser"],
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
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 5.8,
    }
  ],
  gameEvents: [
    {
      timestamp: "20:39:20",
      description: "Malkiz (Morphling) killed Mamika (Soul Collector) — Correct kill",
    },
    {
      timestamp: "20:39:25",
      description: "Zieloony (Jailor) got infected",
    },
    {
      timestamp: "20:39:30",
      description: "Dziekansqr (Executioner) got infected",
    },
    {
      timestamp: "20:39:30",
      description: "Jakubeq (Lookout) reported Mamika's (SoulCollector) body! Meeting started.",
    },
    {
      timestamp: "20:42:20",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:42:50",
      description: "Subek (Blackmailer) killed AlerGeek (Snitch) — Correct kill",
    },
    {
      timestamp: "20:42:54",
      description: "Malkiz (Morphling) got infected",
    },
    {
      timestamp: "20:42:54",
      description: "Malkiz (Morphling) killed Dziekansqr (Executioner) — Correct kill",
    },
    {
      timestamp: "20:42:57",
      description: "Zieloony (Jailor) reported Dziekansqr's (Executioner) body! Meeting started.",
    },
    {
      timestamp: "20:45:46",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:45:47",
      description: "Nudna transformed: Imitator > Snitch (imitated AlerGeek)",
    },
    {
      timestamp: "20:46:07",
      description: "Nudna (Snitch) got infected",
    },
    {
      timestamp: "20:46:07",
      description: "Malkiz (Morphling) killed Nudna (Snitch) — Correct kill",
    },
    {
      timestamp: "20:46:20",
      description: "Bartek (Investigator) got infected",
    },
    {
      timestamp: "20:46:20",
      description: "Nudna transformed: Snitch > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "20:46:20",
      description: "Miras (Plaguebearer) reported Nudna's (Imitator) body! Meeting started.",
    },
    {
      timestamp: "20:49:09",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:49:21",
      description: "Jakubeq (Lookout) got infected",
    },
    {
      timestamp: "20:49:26",
      description: "Bartek (Investigator) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "20:52:15",
      description: "GIMPER 2 (Prosecutor) prosecuted Malkiz (Morphling) — Correct prosecute",
    },
    {
      timestamp: "20:52:15",
      description: "Meeting ended. Malkiz (Morphling) exiled.",
    },
    {
      timestamp: "20:52:26",
      description: "Bushej (Doomsayer) got infected",
    },
    {
      timestamp: "20:52:42",
      description: "ziomson (Deputy) got infected",
    },
    {
      timestamp: "20:52:49",
      description: "brubel (Engineer) got infected",
    },
    {
      timestamp: "20:52:49",
      description: "GIMPER 2 (Prosecutor) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "20:55:32",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:55:41",
      description: "GIMPER 2 (Prosecutor) got infected",
    },
    {
      timestamp: "20:55:54",
      description: "Subek (Blackmailer) got infected",
    },
    {
      timestamp: "20:55:54",
      description: "Miras transformed: Plaguebearer > Pestilence (infected all living players)",
    },
    {
      timestamp: "20:56:55",
      description: "Zieloony (Jailor) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "20:58:16",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:58:37",
      description: "Subek (Blackmailer) killed Jakubeq (Lookout) — Correct kill",
    },
    {
      timestamp: "20:58:38",
      description: "Miras (Pestilence) killed Subek (Blackmailer) — Correct kill",
    },
    {
      timestamp: "20:58:39",
      description: "Zieloony (Jailor) reported Subek's (Blackmailer) body! Meeting started.",
    },
    {
      timestamp: "21:01:15",
      description: "Miras (Pestilence) guessed Zieloony (Jailor) — Correct guess",
    },
    {
      timestamp: "21:01:28",
      description: "Meeting ended. Miras (Pestilence) exiled.",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "Mamika (Soul Collector) - Killed by Malkiz (Morphling)"
      ],
      votes: {
        "AlerGeek": ["Bushej", "Nudna", "ziomson"],
        "Subek": ["GIMPER 2"],
        "Bartek": ["Dziekansqr"]
      },
      skipVotes: [
"Jakubeq", "Subek", "AlerGeek", "Zieloony", "Malkiz", "brubel"
      ],
      noVotes: [

      ],
      blackmailedPlayers: [

      ],
      jailedPlayers: [
"Miras"
      ],
      wasTie: false,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 2,
      deathsSinceLastMeeting: [
        "AlerGeek (Snitch) - Killed by Subek (Blackmailer)"
,        "Dziekansqr (Executioner) - Killed by Malkiz (Morphling)"
      ],
      votes: {
        "Jakubeq": ["Bushej"]
      },
      skipVotes: [
"Nudna", "Zieloony", "Malkiz", "Miras", "Subek", "ziomson", "Jakubeq", "brubel"
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
        "Nudna (Snitch) - Killed by Malkiz (Morphling)"
      ],
      votes: {
        "Malkiz": ["brubel"],
        "Subek": ["GIMPER 2"]
      },
      skipVotes: [
"Subek", "Bushej", "Zieloony", "ziomson", "Jakubeq", "Malkiz"
      ],
      noVotes: [

      ],
      blackmailedPlayers: [

      ],
      jailedPlayers: [
"Bartek"
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
        "Subek": ["ziomson"],
        "Malkiz": ["brubel", "GIMPER 2"],
        "GIMPER 2": ["Bushej"]
      },
      skipVotes: [
"Subek", "Malkiz", "Jakubeq", "Zieloony", "Miras"
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
        "Malkiz (Morphling) - Voted out in Meeting 4"
      ],
      votes: {
        "Subek": ["GIMPER 2", "ziomson"]
      },
      skipVotes: [
"Miras", "Subek", "Bartek", "Jakubeq", "Bushej", "Zieloony", "brubel"
      ],
      noVotes: [

      ],
      blackmailedPlayers: [

      ],
      jailedPlayers: [
"brubel"
      ],
      wasTie: false,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 6,
      deathsSinceLastMeeting: [
      ],
      votes: {
        "252": ["Bartek"],
        "Subek": ["GIMPER 2", "Bushej"],
        "Jakubeq": ["Jakubeq"]
      },
      skipVotes: [
"ziomson", "Subek", "Miras", "brubel", "Zieloony"
      ],
      noVotes: [

      ],
      blackmailedPlayers: [
"Bartek"
      ],
      jailedPlayers: [

      ],
      wasTie: false,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 7,
      deathsSinceLastMeeting: [
        "Jakubeq (Lookout) - Killed by Subek (Blackmailer)"
,        "Subek (Blackmailer) - Killed by Miras (Pestilence)"
      ],
      votes: {
        "Miras": ["GIMPER 2", "brubel", "Bartek", "Zieloony"]
      },
      skipVotes: [
"Bushej", "ziomson", "Miras"
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
