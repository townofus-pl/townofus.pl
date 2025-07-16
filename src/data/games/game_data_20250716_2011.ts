// Generated game data - 2025-07-16 20:35:38

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
    startTime: "2025-07-16 20:11:18",
    endTime: "2025-07-16 20:35:38",
    duration: "24:19",
    playerCount: 15,
    map: "Polus",
    maxTasks: 9,
  },
  players: [
    {
      playerName: "ziomson",
      roleHistory: ["Jester"],
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
      survivedRounds: 9,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.0,
    },
    {
      playerName: "Cleopatrie",
      roleHistory: ["Eclipsal"],
      modifiers: [],
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
      completedTasks: 0,
      survivedRounds: 3,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 8.0,
    },
    {
      playerName: "Jakubeq",
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
      survivedRounds: 6,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.0,
    },
    {
      playerName: "Budyn",
      roleHistory: ["Executioner", "Amnesiac", "Engineer"],
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
      completedTasks: 4,
      survivedRounds: 9,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.4,
    },
    {
      playerName: "Ignorancky",
      roleHistory: ["Engineer"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.9,
    },
    {
      playerName: "Ph4",
      roleHistory: ["Aurial"],
      modifiers: ["Taskmaster", "Shy"],
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
      incorrectSwaps: 0,
      totalPoints: 2.9,
    },
    {
      playerName: "Bartek",
      roleHistory: ["Transporter"],
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
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.9,
    },
    {
      playerName: "Malkiz",
      roleHistory: ["Medic", "Vampire"],
      modifiers: ["Torch"],
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
      completedTasks: 2,
      survivedRounds: 7,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.2,
    },
    {
      playerName: "KiwiSpice",
      roleHistory: ["Venerer"],
      modifiers: [],
      win: 1,
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
      totalPoints: 9.0,
    },
    {
      playerName: "Dziekansqr",
      roleHistory: ["Prosecutor"],
      modifiers: ["Sleuth"],
      win: 0,
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
      completedTasks: 6,
      survivedRounds: 8,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 3.6,
    },
    {
      playerName: "Barox24",
      roleHistory: ["Amnesiac", "Vampire"],
      modifiers: ["Immovable"],
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
      survivedRounds: 5,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 4.0,
    },
    {
      playerName: "Orzehh",
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
      incorrectSwaps: 0,
      totalPoints: 2.9,
    },
    {
      playerName: "brubel",
      roleHistory: ["Swooper"],
      modifiers: ["Disperser", "Sixth Sense"],
      win: 1,
      disconnected: 0,
      initialRolePoints: 2,
      correctKills: 6,
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
      survivedRounds: 9,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 13.0,
    },
    {
      playerName: "Miras",
      roleHistory: ["Altruist"],
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
      survivedRounds: 1,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      totalPoints: 2.9,
    },
    {
      playerName: "smoqu",
      roleHistory: ["Vampire"],
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
      totalPoints: 3.0,
    }
  ],
  gameEvents: [
    {
      timestamp: "20:12:55",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:12:55",
      description: "Orzehh (Swapper) swapped votes between ziomson (Jester) and Orzehh (Swapper)",
    },
    {
      timestamp: "20:13:15",
      description: "Cleopatrie (Eclipsal) killed Bartek (Transporter) — Correct kill",
    },
    {
      timestamp: "20:13:18",
      description: "KiwiSpice (Venerer) killed smoqu (Vampire) — Correct kill",
    },
    {
      timestamp: "20:13:26",
      description: "brubel (Swooper) killed Miras (Altruist) — Correct kill",
    },
    {
      timestamp: "20:13:28",
      description: "Barox24 transformed: Amnesiac > Vampire (remembered role)",
    },
    {
      timestamp: "20:13:28",
      description: "Barox24 (Vampire) reported smoqu's (Mercenary) body! Meeting started.",
    },
    {
      timestamp: "20:15:27",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:15:45",
      description: "Malkiz transformed: Medic > Vampire (vampire bite)",
    },
    {
      timestamp: "20:15:48",
      description: "Malkiz (Vampire) got infected",
    },
    {
      timestamp: "20:16:13",
      description: "Dziekansqr (Prosecutor) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "20:19:01",
      description: "Dziekansqr (Prosecutor) prosecuted Cleopatrie (Eclipsal) — Correct prosecute",
    },
    {
      timestamp: "20:19:01",
      description: "Meeting ended. Cleopatrie (Eclipsal) exiled.",
    },
    {
      timestamp: "20:19:01",
      description: "Orzehh (Swapper) swapped votes between Malkiz (Vampire) and ziomson (Jester)",
    },
    {
      timestamp: "20:19:17",
      description: "Dziekansqr (Prosecutor) pressed the Emergency Button! Meeting started.",
    },
    {
      timestamp: "20:20:50",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:20:50",
      description: "Orzehh (Swapper) swapped votes between KiwiSpice (Venerer) and brubel (Swooper)",
    },
    {
      timestamp: "20:21:02",
      description: "brubel (Swooper) got infected",
    },
    {
      timestamp: "20:21:16",
      description: "Barox24 (Vampire) killed Ph4 (Aurial) — Correct kill",
    },
    {
      timestamp: "20:21:16",
      description: "Budyn transformed: Executioner > Amnesiac (target died)",
    },
    {
      timestamp: "20:21:19",
      description: "Orzehh (Swapper) got infected",
    },
    {
      timestamp: "20:21:19",
      description: "brubel (Swooper) killed Orzehh (Swapper) — Correct kill",
    },
    {
      timestamp: "20:21:20",
      description: "Dziekansqr (Prosecutor) reported Ph4's (Aurial) body! Meeting started.",
    },
    {
      timestamp: "20:24:09",
      description: "Meeting ended. Barox24 (Vampire) exiled.",
    },
    {
      timestamp: "20:24:29",
      description: "Budyn (Amnesiac) got infected",
    },
    {
      timestamp: "20:24:30",
      description: "KiwiSpice (Venerer) killed Ignorancky (Engineer) — Correct kill",
    },
    {
      timestamp: "20:24:41",
      description: "Ignorancky (Engineer) got infected",
    },
    {
      timestamp: "20:24:41",
      description: "Budyn transformed: Amnesiac > Engineer (remembered role)",
    },
    {
      timestamp: "20:24:42",
      description: "Budyn (Engineer) reported Ignorancky's (Crewmate) body! Meeting started.",
    },
    {
      timestamp: "20:27:30",
      description: "Meeting ended. No one exiled (skipped).",
    },
    {
      timestamp: "20:27:48",
      description: "KiwiSpice (Venerer) got infected",
    },
    {
      timestamp: "20:28:11",
      description: "brubel (Swooper) killed Jakubeq (Plaguebearer) — Correct kill",
    },
    {
      timestamp: "20:28:36",
      description: "Malkiz (Vampire) killed KiwiSpice (Venerer) — Correct kill",
    },
    {
      timestamp: "20:28:51",
      description: "Budyn (Engineer) reported Ignorancky's (Crewmate) body! Meeting started.",
    },
    {
      timestamp: "20:31:40",
      description: "Meeting ended. No one exiled (tie).",
    },
    {
      timestamp: "20:32:02",
      description: "brubel (Swooper) killed Malkiz (Vampire) — Correct kill",
    },
    {
      timestamp: "20:32:07",
      description: "ziomson (Jester) got infected",
    },
    {
      timestamp: "20:32:07",
      description: "Budyn (Engineer) reported Ignorancky's (Crewmate) body! Meeting started.",
    },
    {
      timestamp: "20:34:07",
      description: "Meeting ended. No one exiled (tie).",
    },
    {
      timestamp: "20:34:30",
      description: "Dziekansqr (Prosecutor) got infected",
    },
    {
      timestamp: "20:34:30",
      description: "brubel (Swooper) killed Dziekansqr (Prosecutor) — Correct kill",
    },
    {
      timestamp: "20:34:30",
      description: "brubel (Swooper) reported Dziekansqr's (Prosecutor) body! Meeting started.",
    },
    {
      timestamp: "20:35:17",
      description: "Meeting ended. No one exiled (tie).",
    },
    {
      timestamp: "20:35:37",
      description: "brubel (Swooper) killed Budyn (Engineer) — Correct kill",
    }
  ],
  meetings: [
    {
      meetingNumber: 1,
      deathsSinceLastMeeting: [
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
      meetingNumber: 2,
      deathsSinceLastMeeting: [
        "Bartek (Transporter) - Killed by Cleopatrie (Eclipsal)"
,        "smoqu (Vampire) - Killed by KiwiSpice (Venerer)"
,        "Miras (Altruist) - Killed by brubel (Swooper)"
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
      meetingNumber: 3,
      deathsSinceLastMeeting: [
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
        "Cleopatrie (Eclipsal) - Voted out in Meeting 3"
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
      meetingNumber: 5,
      deathsSinceLastMeeting: [
        "Ph4 (Aurial) - Killed by Barox24 (Vampire)"
,        "Orzehh (Swapper) - Killed by brubel (Swooper)"
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
      meetingNumber: 6,
      deathsSinceLastMeeting: [
        "Barox24 (Vampire) - Voted out in Meeting 5"
,        "Ignorancky (Engineer) - Killed by KiwiSpice (Venerer)"
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
      meetingNumber: 7,
      deathsSinceLastMeeting: [
        "Jakubeq (Plaguebearer) - Killed by brubel (Swooper)"
,        "KiwiSpice (Venerer) - Killed by Malkiz (Vampire)"
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
      wasTie: true,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 8,
      deathsSinceLastMeeting: [
        "Malkiz (Vampire) - Killed by brubel (Swooper)"
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
      wasTie: true,
      wasBlessed: false,
    }
,
    {
      meetingNumber: 9,
      deathsSinceLastMeeting: [
        "Dziekansqr (Prosecutor) - Killed by brubel (Swooper)"
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
      wasTie: true,
      wasBlessed: false,
    }
  ],
};
