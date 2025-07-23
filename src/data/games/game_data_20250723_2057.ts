// Generated game data - 2025-07-23 21:12:27

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
    startTime: "2025-07-23 20:57:13",
    endTime: "2025-07-23 21:12:27",
    duration: "15:14",
    playerCount: 16,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "Budyn",
      roleHistory: ["Swapper"],
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
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 1,
      totalPoints: 0.9,
    },
    {
      playerName: "Cleopatrie",
      roleHistory: ["Undertaker"],
      modifiers: [],
      win: 1,
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.0,
    },
    {
      playerName: "Dziekansqr",
      roleHistory: ["Engineer"],
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
      completedTasks: 7,
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.7,
    },
    {
      playerName: "nevs",
      roleHistory: ["Werewolf"],
      modifiers: ["Immovable"],
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
      playerName: "DawDu",
      roleHistory: ["Warlock"],
      modifiers: ["Saboteur", "Shy"],
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
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 10.0,
    },
    {
      playerName: "ziomson",
      roleHistory: ["Vigilante"],
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
      totalPoints: 2.9,
    },
    {
      playerName: "Orzehh",
      roleHistory: ["Altruist"],
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
      completedTasks: 9,
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.9,
    },
    {
      playerName: "Bartek",
      roleHistory: ["Glitch"],
      modifiers: [],
      win: 0,
      disconnected: 0,
      initialRolePoints: 3,
      correctKills: 0,
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
      totalPoints: 4.0,
    },
    {
      playerName: "Miras",
      roleHistory: ["Arsonist"],
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
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.0,
    },
    {
      playerName: "Mamika",
      roleHistory: ["Janitor"],
      modifiers: ["Double Shot", "Button Barry"],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 3,
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
      janitorCleans: 1,
      completedTasks: 0,
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 12.0,
    },
    {
      playerName: "Malkiz",
      roleHistory: ["Plumber"],
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
      completedTasks: 8,
      survivedRounds: 4,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.8,
    },
    {
      playerName: "Ph4",
      roleHistory: ["Prosecutor"],
      modifiers: [],
      win: 0,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 1,
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
      totalPoints: 0.9,
    },
    {
      playerName: "KiwiSpice",
      roleHistory: ["Plaguebearer"],
      modifiers: ["Tiebreaker"],
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
      roleHistory: ["Survivor"],
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
      playerName: "QukaVadi",
      roleHistory: ["Jailor"],
      modifiers: ["Frosty", "Sixth Sense"],
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
      totalPoints: 2.9,
    },
    {
      playerName: "brubel",
      roleHistory: ["Imitator", "Altruist", "Imitator", "Vigilante", "Imitator", "Prosecutor", "Imitator"],
      modifiers: ["Taskmaster", "Radar"],
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
      totalPoints: 2.9,
    }
  ],
  gameEvents: [
    {
      timestamp: "20:57:27",
      description: "DawDu (Warlock) killed nevs (Werewolf) — Correct kill",
    },
    {
      timestamp: "20:57:36",
      description: "Cleopatrie (Undertaker) killed Barox24 (Survivor) — Correct kill",
    },
    {
      timestamp: "20:57:38",
      description: "Miras (Arsonist) reported nevs's (Werewolf) body! Meeting started.",
    },
    {
      timestamp: "21:00:27",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "21:00:27",
      description: "Budyn (Swapper) swapped votes between Bartek (Glitch) and Mamika (Janitor)",
    },
    {
      timestamp: "21:00:38",
      description: "Malkiz (Plumber) got infected",
    },
    {
      timestamp: "21:00:49",
      description: "Bartek (Glitch) got infected",
    },
    {
      timestamp: "21:00:56",
      description: "Cleopatrie (Undertaker) killed Orzehh (Altruist) — Correct kill",
    },
    {
      timestamp: "21:00:57",
      description: "Cleopatrie (Undertaker) reported Orzehh's (Altruist) body! Meeting started.",
    },
    {
      timestamp: "21:01:15",
      description: "Bartek (Glitch) guessed QukaVadi (Jailor) — Correct guess",
    },
    {
      timestamp: "21:03:42",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "21:03:42",
      description: "Budyn (Swapper) swapped votes between Budyn (Swapper) and brubel (Imitator)",
    },
    {
      timestamp: "21:03:42",
      description: "brubel transformed: Imitator > Altruist (imitated Orzehh)",
    },
    {
      timestamp: "21:03:55",
      description: "Miras (Arsonist) got infected",
    },
    {
      timestamp: "21:04:04",
      description: "Mamika (Janitor) got infected",
    },
    {
      timestamp: "21:04:04",
      description: "Mamika (Janitor) killed KiwiSpice (Plaguebearer) — Correct kill",
    },
    {
      timestamp: "21:04:06",
      description: "Cleopatrie (Undertaker) killed ziomson (Vigilante) — Correct kill",
    },
    {
      timestamp: "21:04:11",
      description: "Ph4 (Prosecutor) got infected",
    },
    {
      timestamp: "21:04:11",
      description: "brubel transformed: Altruist > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "21:04:11",
      description: "Ph4 (Prosecutor) reported KiwiSpice's (Plaguebearer) body! Meeting started.",
    },
    {
      timestamp: "21:04:29",
      description: "Cleopatrie (Undertaker) guessed Cleopatrie (Undertaker) — Incorrect guess",
    },
    {
      timestamp: "21:06:57",
      description: "Ph4 (Prosecutor) prosecuted Ph4 (Prosecutor) — Incorrect prosecute",
    },
    {
      timestamp: "21:06:57",
      description: "Meeting ended. Ph4 (Prosecutor) exiled.",
    },
    {
      timestamp: "21:06:57",
      description: "Budyn (Swapper) swapped votes between Mamika (Janitor) and Ph4 (Prosecutor) (INCORRECT)",
    },
    {
      timestamp: "21:06:57",
      description: "brubel transformed: Imitator > Vigilante (imitated ziomson)",
    },
    {
      timestamp: "21:07:28",
      description: "DawDu (Warlock) got infected",
    },
    {
      timestamp: "21:07:28",
      description: "DawDu (Warlock) killed Bartek (Glitch) — Correct kill",
    },
    {
      timestamp: "21:07:28",
      description: "Mamika (Janitor) cleaned Bartek (Glitch)",
    },
    {
      timestamp: "21:08:03",
      description: "DawDu (Warlock) killed Miras (Arsonist) — Correct kill",
    },
    {
      timestamp: "21:08:11",
      description: "brubel transformed: Vigilante > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "21:08:11",
      description: "Malkiz (Plumber) reported Miras's (Arsonist) body! Meeting started.",
    },
    {
      timestamp: "21:09:24",
      description: "Meeting ended. DawDu (Warlock) exiled.",
    },
    {
      timestamp: "21:09:24",
      description: "brubel transformed: Imitator > Prosecutor (imitated Ph4)",
    },
    {
      timestamp: "21:09:53",
      description: "Budyn (Swapper) got infected",
    },
    {
      timestamp: "21:09:53",
      description: "Mamika (Janitor) killed Budyn (Swapper) — Correct kill",
    },
    {
      timestamp: "21:10:33",
      description: "Mamika (Janitor) killed Malkiz (Plumber) — Correct kill",
    },
    {
      timestamp: "21:10:45",
      description: "brubel (Prosecutor) got infected",
    },
    {
      timestamp: "21:10:45",
      description: "brubel transformed: Prosecutor > Imitator (returned to Imitator after meeting)",
    },
    {
      timestamp: "21:10:45",
      description: "brubel (Imitator) reported Malkiz's (Plumber) body! Meeting started.",
    },
    {
      timestamp: "21:12:26",
      description: "Mamika (Janitor) guessed Dziekansqr (Engineer) — Correct guess",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
        "nevs (Werewolf) - Killed by DawDu (Warlock)"
,        "Barox24 (Survivor) - Killed by Cleopatrie (Undertaker)"
      ],
      votes: {

      },
      skipVotes: [

      ],
      noVotes: [

      ],
      blackmailedPlayers: [

      ],
      jailedPlayers: [
"ziomson"
      ],
      wasTie: false,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 2,
      deathsSinceLastMeeting: [
        "Orzehh (Altruist) - Killed by Cleopatrie (Undertaker)"
      ],
      votes: {

      },
      skipVotes: [

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
      meetingNumber: 3,
      deathsSinceLastMeeting: [
        "KiwiSpice (Plaguebearer) - Killed by Mamika (Janitor)"
,        "ziomson (Vigilante) - Killed by Cleopatrie (Undertaker)"
      ],
      votes: {

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
      meetingNumber: 4,
      deathsSinceLastMeeting: [
        "Ph4 (Prosecutor) - Voted out in Meeting 3"
,        "Bartek (Glitch) - Killed by DawDu (Warlock)"
,        "Miras (Arsonist) - Killed by DawDu (Warlock)"
      ],
      votes: {

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
