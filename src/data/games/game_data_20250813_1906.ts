// Generated game data - 2025-08-13 19:20:18

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
    startTime: "2025-08-13 19:06:52",
    endTime: "2025-08-13 19:20:18",
    duration: "13:25",
    playerCount: 17,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Cleric"],
      modifiers: ["Aftermath"],
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.2,
    },
    {
      playerName: "DawDu",
      roleHistory: ["Werewolf"],
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
      playerName: "QukaVadi",
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
      incorrectWardenFortifies: 2,
      janitorCleans: 0,
      completedTasks: 6,
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 0.2,
    },
    {
      playerName: "Cleopatrie",
      roleHistory: ["Plaguebearer"],
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
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.4,
    },
    {
      playerName: "Dziekansqr",
      roleHistory: ["Deputy"],
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
      completedTasks: 9,
      survivedRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.9,
    },
    {
      playerName: "Bartek",
      roleHistory: ["Imitator", "Deputy", "Imitator", "Swapper", "Imitator", "Hunter", "Imitator"],
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
      completedTasks: 8,
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.6,
    },
    {
      playerName: "Jakubeq",
      roleHistory: ["Escapist"],
      modifiers: ["Double Shot", "Radar"],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
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
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 9.8,
    },
    {
      playerName: "Subek",
      roleHistory: ["SoulCollector"],
      modifiers: [],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 6.6,
    },
    {
      playerName: "Budyn",
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
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.2,
    },
    {
      playerName: "Zieloony",
      roleHistory: ["Hunter"],
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
      completedTasks: 4,
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.8,
    },
    {
      playerName: "Orzehh",
      roleHistory: ["Mystic"],
      modifiers: ["Frosty"],
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
      completedTasks: 1,
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 0.0,
    },
    {
      playerName: "Nudna",
      roleHistory: ["Miner"],
      modifiers: ["Disperser"],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
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
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 10.8,
    },
    {
      playerName: "KiwiSpice",
      roleHistory: ["Trapper"],
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
      correctWardenFortifies: 0,
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
      playerName: "Mamika",
      roleHistory: ["Swapper"],
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
      completedTasks: 7,
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.9,
    },
    {
      playerName: "Barox24",
      roleHistory: ["Grenadier"],
      modifiers: ["Underdog"],
      win: 1,
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
      totalPoints: 6.2,
    },
    {
      playerName: "Ignorancky",
      roleHistory: ["Survivor"],
      modifiers: ["Mini"],
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
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.8,
    },
    {
      playerName: "brubel",
      roleHistory: ["Plumber"],
      modifiers: ["Celebrity", "Lover"],
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
      completedTasks: 3,
      survivedRounds: 2,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.7,
    }
  ],
  gameEvents: [
    {
      timestamp: "19:07:01",
      description: "QukaVadi (Warden) CORRECTLY fortified Orzehh (Mystic)",
    },
    {
      timestamp: "19:07:04",
      description: "KiwiSpice (Trapper) got infected",
    },
    {
      timestamp: "19:07:08",
      description: "Barox24 (Grenadier) killed Dziekansqr (Deputy) — Correct kill",
    },
    {
      timestamp: "19:07:13",
      description: "Orzehh (Mystic) reported Dziekansqr's (Deputy) body! Meeting started.",
    },
    {
      timestamp: "19:07:47",
      description: "Barox24 (Grenadier) guessed Barox24 (Grenadier) — Incorrect guess",
    },
    {
      timestamp: "19:10:02",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "19:10:02",
      description: "Bartek transformed: Imitator > Deputy (imitated Dziekansqr)",
    },
    {
      timestamp: "19:10:15",
      description: "[19:10:15] Player Orzehh disconnected from the game",
    },
    {
      timestamp: "19:10:17",
      description: "Bartek (Deputy) got infected",
    },
    {
      timestamp: "19:10:18",
      description: "[19:10:18] Player KiwiSpice disconnected from the game",
    },
    {
      timestamp: "19:10:22",
      description: "Subek (Soul Collector) killed Mamika (Swapper) — Correct kill",
    },
    {
      timestamp: "19:10:26",
      description: "Nudna (Miner) killed DawDu (Werewolf) — Correct kill",
    },
    {
      timestamp: "19:10:29",
      description: "Jakubeq (Escapist) got infected",
    },
    {
      timestamp: "19:10:30",
      description: "QukaVadi (Warden) got infected",
    },
    {
      timestamp: "19:10:30",
      description: "QukaVadi (Warden) INCORRECTLY fortified Cleopatrie (Plaguebearer)",
    },
    {
      timestamp: "19:10:40",
      description: "ziomson (Cleric) got infected",
    },
    {
      timestamp: "19:10:48",
      description: "Nudna (Miner) killed Budyn (Guardian Angel) — Correct kill",
    },
    {
      timestamp: "19:10:48",
      description: "Bartek transformed: Deputy > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "19:10:48",
      description: "ziomson (Cleric) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "19:12:09",
      description: "Jakubeq (Escapist) guessed Cleopatrie (Plaguebearer) — Correct guess",
    },
    {
      timestamp: "19:13:35",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "19:13:35",
      description: "Bartek transformed: Imitator > Swapper (imitated Mamika)",
    },
    {
      timestamp: "19:13:46",
      description: "Zieloony (Hunter) got infected",
    },
    {
      timestamp: "19:13:54",
      description: "Ignorancky (Survivor) got infected",
    },
    {
      timestamp: "19:13:54",
      description: "QukaVadi (Warden) INCORRECTLY fortified Ignorancky (Survivor)",
    },
    {
      timestamp: "19:14:02",
      description: "Subek (Soul Collector) got infected",
    },
    {
      timestamp: "19:14:02",
      description: "brubel (Plumber) died (lover suicide) - partner must have died",
    },
    {
      timestamp: "19:14:02",
      description: "Subek (Soul Collector) killed Zieloony (Hunter) — Correct kill",
    },
    {
      timestamp: "19:14:09",
      description: "Nudna (Miner) got infected",
    },
    {
      timestamp: "19:14:09",
      description: "brubel (Plumber) got infected",
    },
    {
      timestamp: "19:14:09",
      description: "Bartek transformed: Swapper > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "19:14:09",
      description: "ziomson (Cleric) reported brubel's (Plumber) body! Meeting started.",
    },
    {
      timestamp: "19:15:31",
      description: "Nudna (Miner) guessed QukaVadi (Warden) — Correct guess",
    },
    {
      timestamp: "19:16:55",
      description: "Meeting ended. No one exiled (tie).",
    },
    {
      timestamp: "19:16:55",
      description: "Bartek transformed: Imitator > Hunter (imitated Zieloony)",
    },
    {
      timestamp: "19:17:15",
      description: "Subek (Soul Collector) killed ziomson (Cleric) — Correct kill",
    },
    {
      timestamp: "19:17:27",
      description: "Jakubeq (Escapist) killed Subek (Soul Collector) — Correct kill",
    },
    {
      timestamp: "19:17:30",
      description: "Bartek transformed: Hunter > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "19:17:30",
      description: "Jakubeq (Escapist) reported Subek's (SoulCollector) body! Meeting started.",
    },
    {
      timestamp: "19:20:17",
      description: "Meeting ended. Bartek (Imitator) exiled.",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "Dziekansqr (Deputy) - Killed by Barox24 (Grenadier)"
      ],
      votes: {
        "Barox24": ["Budyn"],
        "Orzehh": ["QukaVadi", "Budyn"]
      },
      skipVotes: [
"Nudna", "Cleopatrie", "Orzehh", "brubel", "Subek", "ziomson", "KiwiSpice", "Mamika", "Bartek", "DawDu", "Zieloony"
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
        "Mamika (Swapper) - Killed by Subek (Soul Collector)"
,        "DawDu (Werewolf) - Killed by Nudna (Miner)"
,        "Budyn (Guardian Angel) - Killed by Nudna (Miner)"
      ],
      votes: {
        "Jakubeq": ["QukaVadi"]
      },
      skipVotes: [
"ziomson", "Subek", "brubel", "Bartek", "Jakubeq", "Nudna", "Ignorancky", "Zieloony"
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
        "brubel (Plumber) - Lover suicide (partner died)"
,        "Zieloony (Hunter) - Killed by Subek (Soul Collector)"
      ],
      votes: {
        "Subek": ["ziomson", "Ignorancky", "Jakubeq"]
      },
      skipVotes: [
"Bartek", "Nudna", "Subek"
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
      meetingNumber: 4,
      deathsSinceLastMeeting: [
        "ziomson (Cleric) - Killed by Subek (Soul Collector)"
,        "Subek (Soul Collector) - Killed by Jakubeq (Escapist)"
      ],
      votes: {
        "Bartek": ["Jakubeq", "Ignorancky", "Nudna"],
        "Ignorancky": ["Bartek"]
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
