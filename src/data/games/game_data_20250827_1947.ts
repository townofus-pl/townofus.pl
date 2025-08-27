// Generated game data - 2025-08-27 20:00:46

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
    startTime: "2025-08-27 19:47:12",
    endTime: "2025-08-27 20:00:46",
    duration: "13:34",
    playerCount: 14,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Amnesiac", "Sheriff"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 9.0,
    },
    {
      playerName: "Subek",
      roleHistory: ["Werewolf"],
      modifiers: ["Radar"],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 4,
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
      totalPoints: 5.6,
    },
    {
      playerName: "Bushej",
      roleHistory: ["Mystic"],
      modifiers: ["Multitasker"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.4,
    },
    {
      playerName: "Zieloony",
      roleHistory: ["Imitator", "Altruist", "Imitator"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.5,
    },
    {
      playerName: "GIMPER 2",
      roleHistory: ["Miner"],
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
      playerName: "Nudna",
      roleHistory: ["Sheriff"],
      modifiers: ["Celebrity"],
      win: 1,
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
      completedTasks: 4,
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 9.2,
    },
    {
      playerName: "Bartek",
      roleHistory: ["Cleric"],
      modifiers: ["Frosty"],
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
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.7,
    },
    {
      playerName: "Miras",
      roleHistory: ["Venerer"],
      modifiers: ["Underdog", "Shy"],
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
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.2,
    },
    {
      playerName: "Mamika",
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.6,
    },
    {
      playerName: "Dziekansqr",
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
      completedTasks: 3,
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 1,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 5.7,
    },
    {
      playerName: "Malkiz",
      roleHistory: ["Seer"],
      modifiers: ["Taskmaster", "Immovable"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.7,
    },
    {
      playerName: "AlerGeek",
      roleHistory: ["Plaguebearer", "Pestilence"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.0,
    },
    {
      playerName: "brubel",
      roleHistory: ["Spy"],
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
      completedTasks: 9,
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.9,
    },
    {
      playerName: "Barox24",
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
    }
  ],
  gameEvents: [
    {
      timestamp: "19:47:23",
      description: "Malkiz (Seer) got infected",
    },
    {
      timestamp: "19:47:23",
      description: "Nudna (Sheriff) got infected",
    },
    {
      timestamp: "19:47:28",
      description: "GIMPER 2 (Miner) killed Bartek (Cleric) — Correct kill",
    },
    {
      timestamp: "19:47:29",
      description: "Subek (Werewolf) killed brubel (Spy) — Correct kill",
    },
    {
      timestamp: "19:47:30",
      description: "GIMPER 2 (Miner) reported Bartek's (Cleric) body! Meeting started.",
    },
    {
      timestamp: "19:50:03",
      description: "Meeting ended. GIMPER 2 (Miner) exiled.",
    },
    {
      timestamp: "19:50:14",
      description: "Dziekansqr (Altruist) got infected",
    },
    {
      timestamp: "19:50:26",
      description: "Zieloony (Imitator) got infected",
    },
    {
      timestamp: "19:50:28",
      description: "Subek (Werewolf) killed Miras (Venerer) — Correct kill",
    },
    {
      timestamp: "19:50:33",
      description: "Barox24 (Jester) reported Miras's (Venerer) body! Meeting started.",
    },
    {
      timestamp: "19:50:33",
      description: "Mamika (Doomsayer) got infected",
    },
    {
      timestamp: "19:53:21",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "19:53:30",
      description: "Subek (Werewolf) got infected",
    },
    {
      timestamp: "19:53:32",
      description: "Bushej (Mystic) got infected",
    },
    {
      timestamp: "19:53:37",
      description: "Barox24 (Jester) got infected",
    },
    {
      timestamp: "19:53:38",
      description: "Subek (Werewolf) killed Mamika (Doomsayer) — Correct kill",
    },
    {
      timestamp: "19:53:41",
      description: "Dziekansqr (Altruist) revived Mamika (Doomsayer) — Incorrect revive",
    },
    {
      timestamp: "19:53:43",
      description: "Subek (Werewolf) killed Dziekansqr (Altruist) — Correct kill",
    },
    {
      timestamp: "19:53:45",
      description: "AlerGeek (Plaguebearer) reported Dziekansqr's (Altruist) body! Meeting started.",
    },
    {
      timestamp: "19:55:32",
      description: "Subek (Werewolf) guessed Subek (Werewolf) — Incorrect guess",
    },
    {
      timestamp: "19:56:20",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "19:56:33",
      description: "ziomson (Amnesiac) got infected",
    },
    {
      timestamp: "19:56:33",
      description: "AlerGeek transformed: Plaguebearer > Pestilence (infected all living players)",
    },
    {
      timestamp: "19:56:45",
      description: "Nudna (Sheriff) killed Mamika (Doomsayer) — Correct kill",
    },
    {
      timestamp: "19:56:50",
      description: "Barox24 (Jester) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "19:59:13",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "19:59:13",
      description: "Zieloony transformed: Imitator > Altruist (imitated Dziekansqr)",
    },
    {
      timestamp: "19:59:28",
      description: "AlerGeek (Pestilence) killed Nudna (Sheriff) — Correct kill",
    },
    {
      timestamp: "19:59:30",
      description: "ziomson transformed: Amnesiac > Sheriff (remembered role)",
    },
    {
      timestamp: "19:59:31",
      description: "Zieloony transformed: Altruist > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "19:59:31",
      description: "AlerGeek (Pestilence) reported Nudna's (Crewmate) body! Meeting started.",
    },
    {
      timestamp: "20:00:45",
      description: "AlerGeek (Pestilence) guessed AlerGeek (Pestilence) — Incorrect guess",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "Bartek (Cleric) - Killed by GIMPER 2 (Miner)"
,        "brubel (Spy) - Killed by Subek (Werewolf)"
      ],
      votes: {
        "GIMPER 2": ["Barox24", "ziomson", "Nudna", "Bushej", "Malkiz", "Dziekansqr", "Miras"],
        "Mamika": ["GIMPER 2"],
        "Dziekansqr": ["AlerGeek"],
        "Nudna": ["Mamika"]
      },
      skipVotes: [
"Subek", "Zieloony"
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
        "GIMPER 2 (Miner) - Voted out in Meeting 1"
,        "Miras (Venerer) - Killed by Subek (Werewolf)"
      ],
      votes: {
        "Zieloony": ["Bushej"]
      },
      skipVotes: [
"Dziekansqr", "Subek", "ziomson", "Barox24", "Mamika", "AlerGeek", "Malkiz", "Zieloony", "Nudna"
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
        "Mamika (Doomsayer) - Killed by Subek (Werewolf)"
,        "Dziekansqr (Altruist) - Killed by Subek (Werewolf)"
      ],
      votes: {
        "Mamika": ["Barox24"],
        "Subek": ["Bushej", "AlerGeek", "ziomson", "Mamika", "Nudna", "Malkiz"],
        "Barox24": ["Bushej"],
        "Zieloony": ["Nudna"]
      },
      skipVotes: [
"Zieloony", "Mamika", "AlerGeek", "ziomson", "Malkiz"
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
        "Mamika (Doomsayer) - Killed by Nudna (Sheriff)"
      ],
      votes: {
        "ziomson": ["Barox24"],
        "Zieloony": ["Bushej"],
        "AlerGeek": ["Malkiz"],
        "Nudna": ["AlerGeek"]
      },
      skipVotes: [
"Zieloony", "ziomson", "Nudna"
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
