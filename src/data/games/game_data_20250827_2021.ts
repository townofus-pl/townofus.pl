// Generated game data - 2025-08-27 20:35:46

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
    startTime: "2025-08-27 20:21:17",
    endTime: "2025-08-27 20:35:46",
    duration: "14:29",
    playerCount: 15,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Werewolf"],
      modifiers: ["Flash"],
      win: 1,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 5,
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 15.0,
    },
    {
      playerName: "Mamika",
      roleHistory: ["Prosecutor"],
      modifiers: ["Bait", "Lover", "Shy"],
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
      playerName: "AlerGeek",
      roleHistory: ["Escapist"],
      modifiers: ["Double Shot"],
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
      playerName: "GIMPER 2",
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 4.0,
    },
    {
      playerName: "Bushej",
      roleHistory: ["Altruist"],
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
      completedTasks: 5,
      survivedRounds: 5,
      correctAltruistRevives: 1,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 4.5,
    },
    {
      playerName: "Subek",
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
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.1,
    },
    {
      playerName: "Nudna",
      roleHistory: ["Juggernaut"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 7.0,
    },
    {
      playerName: "Bartek",
      roleHistory: ["Vigilante"],
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
      completedTasks: 9,
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.1,
    },
    {
      playerName: "Dziekansqr",
      roleHistory: ["Snitch"],
      modifiers: ["Taskmaster", "Lover"],
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
      playerName: "Miras",
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
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.2,
    },
    {
      playerName: "brubel",
      roleHistory: ["Imitator", "Swapper", "Imitator", "Vigilante", "Imitator"],
      modifiers: ["Celebrity", "Button Barry"],
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
      playerName: "Barox24",
      roleHistory: ["Lookout"],
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
      completedTasks: 7,
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.7,
    },
    {
      playerName: "Jakubeq",
      roleHistory: ["Undertaker"],
      modifiers: ["Immovable"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.0,
    },
    {
      playerName: "Malkiz",
      roleHistory: ["Medic"],
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
      playerName: "Zieloony",
      roleHistory: ["Swapper"],
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
      timestamp: "20:21:31",
      description: "AlerGeek (Escapist) killed Bartek (Vigilante) — Correct kill",
    },
    {
      timestamp: "20:21:43",
      description: "Bushej (Altruist) revived Bartek (Vigilante) — Correct revive",
    },
    {
      timestamp: "20:21:44",
      description: "ziomson (Werewolf) killed Zieloony (Swapper) — Correct kill",
    },
    {
      timestamp: "20:21:46",
      description: "brubel (Imitator) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "20:23:15",
      description: "AlerGeek (Escapist) guessed AlerGeek (Escapist) — Incorrect guess",
    },
    {
      timestamp: "20:23:55",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:23:55",
      description: "brubel transformed: Imitator > Swapper (imitated Zieloony)",
    },
    {
      timestamp: "20:24:16",
      description: "ziomson (Werewolf) killed Miras (Jester) — Correct kill",
    },
    {
      timestamp: "20:24:20",
      description: "ziomson (Werewolf) killed Bartek (Vigilante) — Correct kill",
    },
    {
      timestamp: "20:24:27",
      description: "ziomson (Werewolf) killed Subek (Mystic) — Correct kill",
    },
    {
      timestamp: "20:24:34",
      description: "brubel transformed: Swapper > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "20:24:35",
      description: "ziomson (Werewolf) reported Miras's (Jester) body! Meeting started.",
    },
    {
      timestamp: "20:27:24",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:27:24",
      description: "brubel transformed: Imitator > Vigilante (imitated Bartek)",
    },
    {
      timestamp: "20:28:42",
      description: "Nudna (Juggernaut) killed Malkiz (Medic) — Correct kill",
    },
    {
      timestamp: "20:28:43",
      description: "Jakubeq (Undertaker) killed brubel (Vigilante) — Correct kill",
    },
    {
      timestamp: "20:28:51",
      description: "brubel transformed: Vigilante > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "20:28:51",
      description: "Jakubeq (Undertaker) reported brubel's (Imitator) body! Meeting started.",
    },
    {
      timestamp: "20:31:17",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:31:48",
      description: "ziomson (Werewolf) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "20:33:30",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:34:03",
      description: "Mamika (Prosecutor) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "20:34:23",
      description: "Jakubeq (Undertaker) guessed Jakubeq (Undertaker) — Incorrect guess",
    },
    {
      timestamp: "20:34:26",
      description: "Nudna (Juggernaut) guessed Mamika (Prosecutor) — Correct guess",
    },
    {
      timestamp: "20:34:48",
      description: "ziomson (Werewolf) guessed GIMPER 2 (Executioner) — Correct guess",
    },
    {
      timestamp: "20:35:16",
      description: "Meeting ended. Bushej (Altruist) exiled.",
    },
    {
      timestamp: "20:35:43",
      description: "Nudna (Juggernaut) killed Barox24 (Lookout) — Correct kill",
    },
    {
      timestamp: "20:35:45",
      description: "ziomson (Werewolf) killed Nudna (Juggernaut) — Correct kill",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "Bartek (Vigilante) - Killed by AlerGeek (Escapist)"
,        "Zieloony (Swapper) - Killed by ziomson (Werewolf)"
      ],
      votes: {
        "AlerGeek": ["Bartek", "Dziekansqr", "Bushej", "Nudna", "ziomson", "Mamika", "GIMPER 2", "brubel", "Subek", "Malkiz", "Miras"],
        "Barox24": ["Barox24", "Bartek"]
      },
      skipVotes: [
"Jakubeq", "Nudna", "ziomson", "Bushej", "GIMPER 2", "Dziekansqr", "Mamika", "brubel", "Malkiz", "Subek", "Miras"
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
        "Miras (Jester) - Killed by ziomson (Werewolf)"
,        "Bartek (Vigilante) - Killed by ziomson (Werewolf)"
,        "Subek (Mystic) - Killed by ziomson (Werewolf)"
      ],
      votes: {
        "Barox24": ["brubel", "GIMPER 2", "Barox24"]
      },
      skipVotes: [
"Mamika", "ziomson", "Bushej", "Malkiz", "Jakubeq", "Nudna"
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
        "Malkiz (Medic) - Killed by Nudna (Juggernaut)"
,        "brubel (Vigilante) - Killed by Jakubeq (Undertaker)"
      ],
      votes: {
        "Bushej": ["GIMPER 2"],
        "Nudna": ["Dziekansqr"]
      },
      skipVotes: [
"Bushej", "Mamika", "Jakubeq", "ziomson", "Nudna", "Barox24"
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
      ],
      votes: {
        "Bushej": ["GIMPER 2", "Barox24"]
      },
      skipVotes: [
"Mamika", "Bushej", "Jakubeq", "Dziekansqr", "Nudna", "ziomson"
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
      ],
      votes: {
        "Jakubeq": ["ziomson", "Bushej", "Mamika", "Barox24", "Dziekansqr", "GIMPER 2"],
        "Bushej": ["GIMPER 2", "Barox24", "ziomson", "Nudna"]
      },
      skipVotes: [
"Bushej"
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
