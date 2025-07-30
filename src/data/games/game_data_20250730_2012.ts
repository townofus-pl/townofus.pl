// Generated game data - 2025-07-30 20:19:45

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
    startTime: "2025-07-30 20:12:48",
    endTime: "2025-07-30 20:19:45",
    duration: "06:56",
    playerCount: 12,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Hunter", "Vampire"],
      modifiers: [],
      win: 0,
      disconnected: 0,
      initialRolePoints: 2,
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.0,
    },
    {
      playerName: "QukaVadi",
      roleHistory: ["Hypnotist"],
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
      totalPoints: 3.0,
    },
    {
      playerName: "Malkiz",
      roleHistory: ["Amnesiac", "Warden"],
      modifiers: ["Button Barry"],
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
      totalPoints: 3.0,
    },
    {
      playerName: "Cleopatrie",
      roleHistory: ["Plaguebearer", "Pestilence"],
      modifiers: [],
      win: 1,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 4,
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
      totalPoints: 13.0,
    },
    {
      playerName: "Jakubeq",
      roleHistory: ["Warden"],
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
      correctWardenFortifies: 1,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 1,
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.1,
    },
    {
      playerName: "Zieloony",
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
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 4.0,
    },
    {
      playerName: "DawDu",
      roleHistory: ["Jester"],
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
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.0,
    },
    {
      playerName: "Budyn",
      roleHistory: ["Prosecutor"],
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
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 5,
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.5,
    },
    {
      playerName: "Bushej",
      roleHistory: ["Imitator", "Prosecutor", "Imitator", "Cleric", "Imitator"],
      modifiers: ["Diseased", "Immovable"],
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
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.4,
    },
    {
      playerName: "Mamika",
      roleHistory: ["Cleric"],
      modifiers: ["Frosty", "Sleuth"],
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
      totalPoints: 2.7,
    },
    {
      playerName: "Dziekansqr",
      roleHistory: ["Blackmailer"],
      modifiers: ["Saboteur"],
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
      totalPoints: 3.0,
    },
    {
      playerName: "smoqu",
      roleHistory: ["Snitch"],
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
      totalPoints: 2.7,
    }
  ],
  gameEvents: [
    {
      timestamp: "20:13:00",
      description: "ziomson transformed: Hunter > Vampire (vampire bite)",
    },
    {
      timestamp: "20:13:01",
      description: "Malkiz (Amnesiac) got infected",
    },
    {
      timestamp: "20:13:09",
      description: "QukaVadi (Hypnotist) killed Budyn (Prosecutor) — Correct kill",
    },
    {
      timestamp: "20:13:09",
      description: "QukaVadi (Hypnotist) reported Budyn's (Prosecutor) body! Meeting started.",
    },
    {
      timestamp: "20:14:20",
      description: "Meeting ended. QukaVadi (Hypnotist) exiled.",
    },
    {
      timestamp: "20:14:20",
      description: "Bushej transformed: Imitator > Prosecutor (imitated Budyn)",
    },
    {
      timestamp: "20:14:29",
      description: "Jakubeq (Warden) CORRECTLY fortified smoqu (Snitch)",
    },
    {
      timestamp: "20:14:30",
      description: "Dziekansqr (Blackmailer) got infected",
    },
    {
      timestamp: "20:14:40",
      description: "Mamika (Cleric) got infected",
    },
    {
      timestamp: "20:14:51",
      description: "Bushej (Prosecutor) got infected",
    },
    {
      timestamp: "20:15:12",
      description: "Jakubeq (Warden) got infected",
    },
    {
      timestamp: "20:15:13",
      description: "Dziekansqr (Blackmailer) killed Jakubeq (Warden) — Correct kill",
    },
    {
      timestamp: "20:15:23",
      description: "smoqu (Snitch) got infected",
    },
    {
      timestamp: "20:15:24",
      description: "Malkiz transformed: Amnesiac > Warden (remembered role)",
    },
    {
      timestamp: "20:15:29",
      description: "Bushej transformed: Prosecutor > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "20:15:29",
      description: "Malkiz (Warden) reported Jakubeq's (Crewmate) body! Meeting started.",
    },
    {
      timestamp: "20:16:08",
      description: "Cleopatrie (Plaguebearer) guessed Mamika (Cleric) — Correct guess",
    },
    {
      timestamp: "20:18:15",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:18:15",
      description: "Bushej transformed: Imitator > Cleric (imitated Mamika)",
    },
    {
      timestamp: "20:18:25",
      description: "DawDu (Jester) got infected",
    },
    {
      timestamp: "20:18:39",
      description: "ziomson (Vampire) got infected",
    },
    {
      timestamp: "20:18:39",
      description: "ziomson (Vampire) killed DawDu (Jester) — Correct kill",
    },
    {
      timestamp: "20:18:41",
      description: "Dziekansqr (Blackmailer) got infected",
    },
    {
      timestamp: "20:18:54",
      description: "Zieloony (Vampire) got infected",
    },
    {
      timestamp: "20:18:54",
      description: "Zieloony (Vampire) killed Dziekansqr (Blackmailer) — Correct kill",
    },
    {
      timestamp: "20:18:54",
      description: "Cleopatrie transformed: Plaguebearer > Pestilence (infected all living players)",
    },
    {
      timestamp: "20:19:05",
      description: "Cleopatrie (Pestilence) killed Bushej (Cleric) — Correct kill",
    },
    {
      timestamp: "20:19:07",
      description: "Cleopatrie (Pestilence) killed Malkiz (Warden) — Correct kill",
    },
    {
      timestamp: "20:19:21",
      description: "Cleopatrie (Pestilence) killed Zieloony (Vampire) — Correct kill",
    },
    {
      timestamp: "20:19:22",
      description: "Cleopatrie (Pestilence) killed Zieloony (Vampire) — Correct kill",
    },
    {
      timestamp: "20:19:22",
      description: "ziomson (Vampire) killed smoqu (Snitch) — Correct kill",
    },
    {
      timestamp: "20:19:29",
      description: "Bushej transformed: Cleric > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "20:19:29",
      description: "ziomson (Vampire) reported smoqu's (Snitch) body! Meeting started.",
    },
    {
      timestamp: "20:19:44",
      description: "ziomson (Vampire) guessed ziomson (Vampire) — Incorrect guess",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "Budyn (Prosecutor) - Killed by QukaVadi (Hypnotist)"
      ],
      votes: {
        "QukaVadi": ["Cleopatrie", "ziomson", "smoqu", "Bushej", "Mamika", "Dziekansqr", "Malkiz"]
      },
      skipVotes: [
"DawDu", "Zieloony", "Jakubeq", "QukaVadi"
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
        "QukaVadi (Hypnotist) - Voted out in Meeting 1"
,        "Jakubeq (Warden) - Killed by Dziekansqr (Blackmailer)"
      ],
      votes: {
        "252": ["Mamika"],
        "ziomson": ["Bushej"],
        "Bushej": ["DawDu"]
      },
      skipVotes: [
"Zieloony", "Dziekansqr", "Cleopatrie", "ziomson", "Malkiz", "smoqu"
      ],
      noVotes: [

      ],
      blackmailedPlayers: [
"Mamika"
      ],
      jailedPlayers: [

      ],
      wasTie: false,
      wasBlessed: false,
    }
  ],
};
