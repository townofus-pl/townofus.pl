// Generated game data - 2025-08-27 21:21:17

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
    startTime: "2025-08-27 21:03:55",
    endTime: "2025-08-27 21:21:17",
    duration: "17:22",
    playerCount: 14,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Juggernaut"],
      modifiers: [],
      win: 1,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 2,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 2,
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
      totalPoints: 13.0,
    },
    {
      playerName: "Bartek",
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.6,
    },
    {
      playerName: "Jakubeq",
      roleHistory: ["Engineer"],
      modifiers: ["Mini"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.5,
    },
    {
      playerName: "Bushej",
      roleHistory: ["Warden"],
      modifiers: [],
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
      correctWardenFortifies: 1,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 1,
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 0.0,
    },
    {
      playerName: "Subek",
      roleHistory: ["Altruist"],
      modifiers: ["Taskmaster"],
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
      playerName: "Mamika",
      roleHistory: ["Plaguebearer", "Pestilence"],
      modifiers: ["Giant"],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 0,
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
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 1.8,
    },
    {
      playerName: "Zieloony",
      roleHistory: ["Medic"],
      modifiers: ["Immovable"],
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
      correctMedicShields: 1,
      incorrectMedicShields: 1,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 8,
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.2,
    },
    {
      playerName: "Nudna",
      roleHistory: ["Imitator", "Deputy", "Imitator", "Altruist", "Imitator", "Altruist", "Imitator", "Altruist", "Imitator"],
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
      survivedRounds: 4,
      correctAltruistRevives: 1,
      incorrectAltruistRevives: 1,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.5,
    },
    {
      playerName: "Miras",
      roleHistory: ["Spy"],
      modifiers: ["Multitasker", "Button Barry"],
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
      playerName: "GIMPER 2",
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
      playerName: "Dziekansqr",
      roleHistory: ["Undertaker"],
      modifiers: ["Underdog"],
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
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.8,
    },
    {
      playerName: "brubel",
      roleHistory: ["Janitor"],
      modifiers: ["Double Shot"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.0,
    },
    {
      playerName: "Malkiz",
      roleHistory: ["Lookout"],
      modifiers: ["Diseased", "Shy"],
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
      playerName: "Barox24",
      roleHistory: ["Deputy"],
      modifiers: ["Tiebreaker"],
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
      completedTasks: 1,
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.1,
    }
  ],
  gameEvents: [
    {
      timestamp: "21:04:03",
      description: "Bushej (Warden) CORRECTLY fortified Nudna (Imitator)",
    },
    {
      timestamp: "21:04:07",
      description: "Barox24 (Deputy) got infected",
    },
    {
      timestamp: "21:04:07",
      description: "Bartek (Executioner) got infected",
    },
    {
      timestamp: "21:04:10",
      description: "brubel (Janitor) killed Subek (Altruist) — Correct kill",
    },
    {
      timestamp: "21:04:12",
      description: "Dziekansqr (Undertaker) killed GIMPER 2 (Jester) — Correct kill",
    },
    {
      timestamp: "21:04:15",
      description: "ziomson (Juggernaut) got infected",
    },
    {
      timestamp: "21:04:15",
      description: "ziomson (Juggernaut) killed Barox24 (Deputy) — Correct kill",
    },
    {
      timestamp: "21:04:17",
      description: "ziomson (Juggernaut) reported Barox24's (Deputy) body! Meeting started.",
    },
    {
      timestamp: "21:07:00",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "21:07:01",
      description: "Nudna transformed: Imitator > Deputy (imitated Barox24)",
    },
    {
      timestamp: "21:07:10",
      description: "brubel (Janitor) got infected",
    },
    {
      timestamp: "21:07:21",
      description: "Bushej (Warden) got infected",
    },
    {
      timestamp: "21:07:33",
      description: "Zieloony (Medic) got infected",
    },
    {
      timestamp: "21:07:48",
      description: "Zieloony (Medic) INCORRECTLY shielded Mamika (Plaguebearer)",
    },
    {
      timestamp: "21:07:49",
      description: "Malkiz (Lookout) got infected",
    },
    {
      timestamp: "21:08:08",
      description: "brubel (Janitor) killed Bushej (Warden) — Correct kill",
    },
    {
      timestamp: "21:08:13",
      description: "Dziekansqr (Undertaker) got infected",
    },
    {
      timestamp: "21:08:14",
      description: "Nudna transformed: Deputy > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "21:08:14",
      description: "Malkiz (Lookout) reported Bushej's (Warden) body! Meeting started.",
    },
    {
      timestamp: "21:11:03",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "21:11:03",
      description: "Nudna transformed: Imitator > Altruist (imitated Subek)",
    },
    {
      timestamp: "21:11:11",
      description: "[21:11:11] Player Bushej disconnected from the game",
    },
    {
      timestamp: "21:11:13",
      description: "Jakubeq (Engineer) got infected",
    },
    {
      timestamp: "21:11:24",
      description: "Nudna (Altruist) got infected",
    },
    {
      timestamp: "21:11:29",
      description: "brubel (Janitor) killed Zieloony (Medic) — Correct kill",
    },
    {
      timestamp: "21:11:36",
      description: "Nudna (Altruist) revived Zieloony (Medic) — Correct revive",
    },
    {
      timestamp: "21:11:42",
      description: "Zieloony (Medic) CORRECTLY shielded Nudna (Altruist)",
    },
    {
      timestamp: "21:11:46",
      description: "Dziekansqr (Undertaker) killed Zieloony (Medic) — Correct kill",
    },
    {
      timestamp: "21:11:47",
      description: "Nudna transformed: Altruist > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "21:11:47",
      description: "Malkiz (Lookout) reported Zieloony's (Medic) body! Meeting started.",
    },
    {
      timestamp: "21:14:34",
      description: "Meeting ended. Malkiz (Lookout) exiled.",
    },
    {
      timestamp: "21:14:34",
      description: "Nudna transformed: Imitator > Altruist (imitated Subek)",
    },
    {
      timestamp: "21:14:44",
      description: "Miras (Spy) got infected",
    },
    {
      timestamp: "21:14:44",
      description: "Mamika transformed: Plaguebearer > Pestilence (infected all living players)",
    },
    {
      timestamp: "21:14:54",
      description: "brubel (Janitor) killed Bartek (Executioner) — Correct kill",
    },
    {
      timestamp: "21:15:13",
      description: "Nudna (Altruist) revived Bartek (Executioner) — Incorrect revive",
    },
    {
      timestamp: "21:15:23",
      description: "Dziekansqr (Undertaker) killed Bartek (Executioner) — Correct kill",
    },
    {
      timestamp: "21:15:24",
      description: "Nudna transformed: Altruist > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "21:15:24",
      description: "Nudna (Imitator) reported Bartek's (Executioner) body! Meeting started.",
    },
    {
      timestamp: "21:17:14",
      description: "Dziekansqr (Undertaker) guessed Dziekansqr (Undertaker) — Incorrect guess",
    },
    {
      timestamp: "21:17:52",
      description: "Mamika (Pestilence) guessed Mamika (Pestilence) — Incorrect guess",
    },
    {
      timestamp: "21:18:12",
      description: "Meeting ended. No one exiled (tie).",
    },
    {
      timestamp: "21:18:12",
      description: "Nudna transformed: Imitator > Altruist (imitated Subek)",
    },
    {
      timestamp: "21:18:35",
      description: "ziomson (Juggernaut) killed Nudna (Altruist) — Correct kill",
    },
    {
      timestamp: "21:18:41",
      description: "Nudna transformed: Altruist > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "21:18:41",
      description: "Miras (Spy) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "21:21:07",
      description: "ziomson (Juggernaut) guessed brubel (Janitor) — Correct guess",
    },
    {
      timestamp: "21:21:16",
      description: "ziomson (Juggernaut) guessed Jakubeq (Engineer) — Correct guess",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "Subek (Altruist) - Killed by brubel (Janitor)"
,        "GIMPER 2 (Jester) - Killed by Dziekansqr (Undertaker)"
,        "Barox24 (Deputy) - Killed by ziomson (Juggernaut)"
      ],
      votes: {
        "ziomson": ["Nudna", "Jakubeq", "Bushej"],
        "Bartek": ["Dziekansqr"]
      },
      skipVotes: [
"Zieloony", "Bartek", "Mamika", "Malkiz", "ziomson", "brubel", "Miras"
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
        "Bushej (Warden) - Killed by brubel (Janitor)"
      ],
      votes: {
        "brubel": ["Malkiz", "Nudna"],
        "ziomson": ["Bartek"],
        "Malkiz": ["Dziekansqr"]
      },
      skipVotes: [
"Zieloony", "Mamika", "brubel", "Jakubeq", "ziomson", "Miras"
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
        "Zieloony (Medic) - Killed by brubel (Janitor)"
,        "Zieloony (Medic) - Killed by Dziekansqr (Undertaker)"
      ],
      votes: {
        "Malkiz": ["Mamika", "Miras", "brubel", "Bartek", "ziomson"],
        "Dziekansqr": ["Malkiz", "Nudna", "Jakubeq"]
      },
      skipVotes: [
"Dziekansqr"
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
        "Malkiz (Lookout) - Voted out in Meeting 3"
,        "Bartek (Executioner) - Killed by brubel (Janitor)"
,        "Bartek (Executioner) - Killed by Dziekansqr (Undertaker)"
      ],
      votes: {
        "Dziekansqr": ["Mamika", "Nudna", "Jakubeq", "Miras"],
        "Mamika": ["brubel", "ziomson"],
        "brubel": ["Miras", "Jakubeq"],
        "Jakubeq": ["Nudna"]
      },
      skipVotes: [
"brubel", "ziomson"
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
  ],
};
