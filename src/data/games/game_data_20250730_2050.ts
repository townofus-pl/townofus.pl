// Generated game data - 2025-07-30 21:01:22

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
    startTime: "2025-07-30 20:50:59",
    endTime: "2025-07-30 21:01:22",
    duration: "10:23",
    playerCount: 14,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Medic"],
      modifiers: ["Aftermath", "Lover"],
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
      playerName: "Cleopatrie",
      roleHistory: ["Seer"],
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
      completedTasks: 2,
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.2,
    },
    {
      playerName: "Bushej",
      roleHistory: ["Grenadier"],
      modifiers: [],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 2,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 1,
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
      totalPoints: 8.0,
    },
    {
      playerName: "Zieloony",
      roleHistory: ["SoulCollector"],
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
      playerName: "Malkiz",
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
      completedTasks: 2,
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.2,
    },
    {
      playerName: "Budyn",
      roleHistory: ["Plaguebearer"],
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
      playerName: "Mamika",
      roleHistory: ["Amnesiac", "SoulCollector"],
      modifiers: ["Sixth Sense"],
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
      playerName: "Barox24",
      roleHistory: ["Glitch"],
      modifiers: ["Flash"],
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
      playerName: "QukaVadi",
      roleHistory: ["Plumber"],
      modifiers: ["Lover"],
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
      playerName: "Jakubeq",
      roleHistory: ["Jailor"],
      modifiers: ["Multitasker"],
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
    },
    {
      playerName: "smoqu",
      roleHistory: ["Aurial"],
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
      completedTasks: 3,
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.3,
    },
    {
      playerName: "brubel",
      roleHistory: ["Escapist"],
      modifiers: ["Disperser", "Sleuth"],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 1,
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 10.0,
    },
    {
      playerName: "DawDu",
      roleHistory: ["Juggernaut"],
      modifiers: ["Satellite"],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
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
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 5.0,
    },
    {
      playerName: "Dziekansqr",
      roleHistory: ["Imitator", "Jailor", "Imitator", "Aurial", "Imitator"],
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
      totalPoints: 2.3,
    }
  ],
  gameEvents: [
    {
      timestamp: "20:51:11",
      description: "Cleopatrie (Seer) got infected",
    },
    {
      timestamp: "20:51:11",
      description: "Barox24 (Glitch) got infected",
    },
    {
      timestamp: "20:51:12",
      description: "Zieloony (Soul Collector) killed smoqu (Aurial) — Correct kill",
    },
    {
      timestamp: "20:51:12",
      description: "Barox24 (Glitch) killed Budyn (Plaguebearer) — Correct kill",
    },
    {
      timestamp: "20:51:14",
      description: "DawDu (Juggernaut) killed Jakubeq (Jailor) — Correct kill",
    },
    {
      timestamp: "20:51:17",
      description: "Barox24 (Glitch) reported Budyn's (Plaguebearer) body! Meeting started.",
    },
    {
      timestamp: "20:52:03",
      description: "brubel (Escapist) guessed Barox24 (Glitch) — Correct guess",
    },
    {
      timestamp: "20:54:01",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:54:02",
      description: "Dziekansqr transformed: Imitator > Jailor (imitated Jakubeq)",
    },
    {
      timestamp: "20:54:23",
      description: "ziomson (Medic) got infected",
    },
    {
      timestamp: "20:54:26",
      description: "DawDu (Juggernaut) killed Zieloony (Soul Collector) — Correct kill",
    },
    {
      timestamp: "20:54:36",
      description: "Bushej (Grenadier) killed DawDu (Juggernaut) — Correct kill",
    },
    {
      timestamp: "20:54:37",
      description: "brubel (Escapist) got infected",
    },
    {
      timestamp: "20:54:49",
      description: "Dziekansqr (Jailor) got infected",
    },
    {
      timestamp: "20:54:59",
      description: "Mamika transformed: Amnesiac > SoulCollector (remembered role)",
    },
    {
      timestamp: "20:55:06",
      description: "Malkiz (Detective) got infected",
    },
    {
      timestamp: "20:55:12",
      description: "DawDu (Juggernaut) got infected",
    },
    {
      timestamp: "20:55:12",
      description: "Dziekansqr transformed: Jailor > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "20:55:12",
      description: "Malkiz (Detective) reported DawDu's (Juggernaut) body! Meeting started.",
    },
    {
      timestamp: "20:58:01",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:58:02",
      description: "Dziekansqr transformed: Imitator > Aurial (imitated smoqu)",
    },
    {
      timestamp: "20:58:14",
      description: "Mamika (Soul Collector) got infected",
    },
    {
      timestamp: "20:58:22",
      description: "brubel (Escapist) killed Mamika (Soul Collector) — Correct kill",
    },
    {
      timestamp: "20:58:27",
      description: "Bushej (Grenadier) got infected",
    },
    {
      timestamp: "20:58:27",
      description: "Bushej (Grenadier) killed Dziekansqr (Aurial) — Correct kill",
    },
    {
      timestamp: "20:58:46",
      description: "Dziekansqr transformed: Aurial > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "20:58:46",
      description: "Malkiz (Detective) reported Dziekansqr's (Imitator) body! Meeting started.",
    },
    {
      timestamp: "20:59:35",
      description: "Bushej (Grenadier) guessed Cleopatrie (Seer) — Correct guess",
    },
    {
      timestamp: "21:00:00",
      description: "Bushej (Grenadier) guessed Bushej (Grenadier) — Incorrect guess",
    },
    {
      timestamp: "21:01:21",
      description: "brubel (Escapist) guessed ziomson (Medic) — Correct guess",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "smoqu (Aurial) - Killed by Zieloony (Soul Collector)"
,        "Budyn (Plaguebearer) - Killed by Barox24 (Glitch)"
,        "Jakubeq (Jailor) - Killed by DawDu (Juggernaut)"
      ],
      votes: {
        "Zieloony": ["ziomson", "QukaVadi"]
      },
      skipVotes: [
"Mamika", "Cleopatrie", "Malkiz", "Dziekansqr", "DawDu", "brubel", "Bushej", "Zieloony"
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
        "Zieloony (Soul Collector) - Killed by DawDu (Juggernaut)"
,        "DawDu (Juggernaut) - Killed by Bushej (Grenadier)"
      ],
      votes: {
        "brubel": ["Cleopatrie"],
        "Cleopatrie": ["Bushej"]
      },
      skipVotes: [
"brubel", "Mamika", "ziomson", "QukaVadi", "Dziekansqr"
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
