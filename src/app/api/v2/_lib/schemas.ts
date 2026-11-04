import { z } from 'zod';

// Lista dozwolonych pól publicznego API. Każda odpowiedź przechodzi przez
// `Schema.parse(...)`, więc pole spoza schematu nigdy nie trafia do klienta,
// nawet gdy serwis zacznie je zwracać. Te same schematy opisują `/api/schema`.

const date = z.string().describe('Data sesji w formacie YYYYMMDD');
const gameId = z.string().describe('Identyfikator gry, np. 20261021_1106');

export const SeasonSchema = z.object({
  id: z.number().int(),
  current: z.boolean(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});
export const SeasonsResponseSchema = z.object({ seasons: z.array(SeasonSchema) });

export const SessionListItemSchema = z.object({
  date,
  displayDate: z.string(),
  totalGames: z.number().int(),
  gameIds: z.array(gameId),
  players: z.array(z.string()),
  hasSessionList: z.boolean().describe('Czy dla tej daty istnieje lista graczy sesji'),
});
export const SessionsResponseSchema = z.object({
  season: z.number().int(),
  sessions: z.array(SessionListItemSchema),
});

export const GameSummarySchema = z.object({
  id: gameId,
  date,
  gameNumber: z.number().int(),
  duration: z.string(),
  players: z.number().int(),
  winner: z.string(),
  winCondition: z.string(),
  map: z.string(),
  winnerNames: z.array(z.string()),
  allPlayerNames: z.array(z.string()),
});
export const GamesResponseSchema = z.object({
  season: z.number().int(),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
  games: z.array(GameSummarySchema),
});

const WinLossSchema = z.enum(['W', 'L']).nullable();

export const SessionPlayerSchema = z.object({
  name: z.string(),
  games: z.number().int(),
  wins: z.number().int(),
  loses: z.number().int(),
  winRatio: z.number(),
  results: z.array(WinLossSchema),
});
export const SessionRoleSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  team: z.string(),
  games: z.number().int(),
  wins: z.number().int(),
  loses: z.number().int(),
  winRatio: z.number(),
  results: z.array(WinLossSchema),
});
export const SessionListPlayerSchema = z.object({
  name: z.string(),
  rating: z.number().nullable(),
});
export const SessionResponseSchema = z.object({
  season: z.number().int(),
  date,
  displayDate: z.string(),
  totalGames: z.number().int(),
  crewmateWins: z.number().int(),
  impostorWins: z.number().int(),
  neutralWins: z.number().int(),
  games: z.array(GameSummarySchema),
  players: z.array(SessionPlayerSchema),
  roles: z.array(SessionRoleSchema),
  sessionList: z.object({ players: z.array(SessionListPlayerSchema) }).nullable()
    .describe('Lista graczy sesji, jeśli ją opublikowano'),
});

const PairSchema = z.object({ correct: z.number(), incorrect: z.number() });
const pairs = <K extends string>(keys: readonly K[]) =>
  z.object(Object.fromEntries(keys.map((key) => [key, PairSchema])) as Record<K, typeof PairSchema>);

// Grupy jak na stronie (funkcja `categorize()` w `statsBreakdown.ts`), więc sumy w API
// zgadzają się z liczbami na stronie. `types` rozkłada grupę na rodzaje akcji.
const CountersSchema = z.object({
  kills: PairSchema.extend({
    types: pairs(['kills', 'jailorExecutes', 'deputyShoots'] as const),
  }).describe('Zabójstwa, egzekucje Jailora i strzały Deputy.'),
  guesses: PairSchema.describe('Zgadywanie ról.'),
  protects: PairSchema.extend({
    types: pairs(['protects', 'wardenFortifies'] as const),
  }).describe(
    'Ochrony. Od sezonu 4 wzmocnienia Wardena (wardenFortifies) są tutaj. W sezonach 1-3 są w grupie other. Ochrony Monarcha są pokazane jako knights w grupie other, nie tutaj.',
  ),
  other: PairSchema.extend({
    types: pairs(['prosecutes', 'altruistRevives', 'swaps', 'janitorCleans', 'knights', 'wardenFortifies'] as const),
  }).describe(
    'Pozostałe akcje. knights to pasowanie rycerzy przez Monarcha. wardenFortifies jest tu w sezonach 1-3. Czyszczenie ciał Janitora (janitorCleans) liczy się jako correct.',
  ),
  votes: PairSchema.describe('Głosy. Tylko gry z danymi akcji.'),
});

export const GamePlayerSchema = z.object({
  nickname: z.string(),
  role: z.string(),
  roleHistory: z.array(z.string()),
  modifiers: z.array(z.string()),
  team: z.string(),
  win: z.boolean(),
  survived: z.boolean(),
  completedTasks: z.number(),
  survivedRounds: z.number().default(0),
  counters: CountersSchema,
});

const MeetingSchema = z.object({
  meetingNumber: z.number().int(),
  exiledPlayer: z.string().nullable().optional(),
  deathsSinceLastMeeting: z.array(z.string()),
  deathsDuringMeeting: z.array(z.string()).optional(),
  votes: z.record(z.string(), z.array(z.string())),
  skipVotes: z.array(z.string()),
  noVotes: z.array(z.string()),
  blackmailedPlayers: z.array(z.string()).optional(),
  jailedPlayers: z.array(z.string()).optional(),
  wasTie: z.boolean(),
  wasBlessed: z.boolean(),
});

const GameEventSchema = z.object({
  timestamp: z.string(),
  type: z.string(),
  actionType: z.string().optional(),
  player: z.string(),
  playerRole: z.string().optional(),
  target: z.string().optional(),
  targetRole: z.string().optional(),
  description: z.string(),
  isCorrect: z.boolean().nullable().optional(),
  actionLabel: z.string().optional(),
  ability: z.object({ name: z.string(), icon: z.string() }).optional().describe('Zdolność użyta w akcji'),
  killAbility: z.object({ name: z.string(), icon: z.string() }).optional().describe('Zdolność użyta do zabójstwa'),
  survivors: z.array(z.object({ name: z.string(), role: z.string().optional(), color: z.string().optional() })).optional()
    .describe('Gracze, którzy przetrwali rundę (zdarzenie round_survived)'),
});

export const GameResponseSchema = z.object({
  season: z.number().int().nullable(),
  id: gameId,
  date,
  startTime: z.string(),
  endTime: z.string(),
  duration: z.string(),
  map: z.string(),
  winner: z.string(),
  winCondition: z.string(),
  winnerNames: z.array(z.string()),
  maxTasks: z.number().int().nullable().describe('Liczba zadań w grze, jeśli znana'),
  players: z.array(GamePlayerSchema).describe(
    'Gracze w kolejności ze strony gry. Gra z ostatniego dnia z grami w sezonie: alfabetycznie. Starsza gra: kolejność „Standardowo”.',
  ),
  meetings: z.array(MeetingSchema),
  hasTimeline: z.boolean(),
  events: z.array(GameEventSchema),
});

export const ActionSchema = z.object({
  gameId,
  date,
  season: z.number().int(),
  timestamp: z.string(),
  timestampMs: z.number().int(),
  type: z.enum(['kill', 'death']),
  performer: z.string(),
  performerRole: z.string(),
  target: z.string().nullable(),
  targetRole: z.string().nullable(),
  isCorrect: z.boolean().nullable(),
  causeOfDeath: z.string().nullable(),
  isGuess: z.boolean().nullable(),
  guessedRole: z.string().nullable(),
  guessedModifier: z.string().nullable(),
});
export const ActionsResponseSchema = z.object({
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
  actions: z.array(ActionSchema),
});

export const RankingPlayerSchema = z.object({
  rank: z.number().int(),
  playerName: z.string(),
  rating: z.number(),
  dap: z.number().describe('Wartość opóźniona: bez ostatniego dnia z grami w sezonie'),
  totalGames: z.number().int(),
  wins: z.number().int(),
  losses: z.number().int(),
  winRate: z.number(),
  lastUpdated: z.string(),
  isEmperor: z.boolean(),
});
export const RankingResponseSchema = z.object({
  season: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
  emperor: z.string().nullable().describe('Cesarz pokazany na stronie rankingu'),
  players: z.array(RankingPlayerSchema),
});

export const PlayerResponseSchema = z.object({
  season: z.number().int(),
  name: z.string(),
  stars: z.number().int(),
  rating: z.number().nullable(),
  stats: z.object({
    gamesPlayed: z.number().int(),
    wins: z.number().int(),
    winRate: z.number(),
    impostorGames: z.number().int(),
    crewmateGames: z.number().int(),
    neutralGames: z.number().int(),
    totalTasks: z.number(),
    maxTasks: z.number(),
    survivedRounds: z.number(),
    totalRounds: z.number(),
  }).extend({
    correctKills: z.number(), incorrectKills: z.number(),
    correctGuesses: z.number(), incorrectGuesses: z.number(),
    correctProsecutes: z.number(), incorrectProsecutes: z.number(),
    correctDeputyShoots: z.number(), incorrectDeputyShoots: z.number(),
    correctJailorExecutes: z.number(), incorrectJailorExecutes: z.number(),
    correctProtects: z.number(), incorrectProtects: z.number(),
    correctWardenFortifies: z.number(), incorrectWardenFortifies: z.number(),
    janitorCleans: z.number(),
    correctAltruistRevives: z.number(), incorrectAltruistRevives: z.number(),
    correctSwaps: z.number(), incorrectSwaps: z.number(),
  }),
  roleBreakdown: z.record(z.string(), z.object({
    games: z.number().int(),
    categories: z.object({
      kills: PairSchema, guesses: PairSchema, protects: PairSchema, other: PairSchema, votes: PairSchema,
    }),
  })).optional(),
  ratingHistory: z.array(z.object({
    date: z.string(),
    rating: z.number(),
    reason: z.string().nullable(),
    gameId: gameId.nullable(),
  })),
  bestGames: z.array(z.object({
    gameId,
    date: z.string(),
    map: z.string(),
    duration: z.string(),
    role: z.string(),
    team: z.string(),
    win: z.boolean(),
  })).describe('Najlepsze gry gracza w kolejności ze strony gracza, bez gier z ostatniego dnia z grami w sezonie'),
  hasMoreBestGames: z.boolean(),
  voting: z.object({
    totalVotesCast: z.number(),
    totalVotesReceived: z.number(),
    timesVotedOut: z.number(),
    totalMeetings: z.number(),
    skipVotes: z.number(),
    skipRate: z.number(),
    bandwagonFactor: z.number(),
    votingTargets: z.array(z.object({ playerName: z.string(), voteCount: z.number(), percentage: z.number() })),
    votedByPlayers: z.array(z.object({ playerName: z.string(), voteCount: z.number(), percentage: z.number() })),
  }),
});

export const RoleSummarySchema = z.object({
  name: z.string(),
  displayName: z.string(),
  color: z.string(),
  team: z.string(),
  gamesPlayed: z.number().int(),
  wins: z.number().int(),
  winRate: z.number(),
  dapGames: z.number().int().describe('Liczba rozgrywek wliczonych do wartości DAP'),
  dap: z.number().describe('Wartość opóźniona: bez ostatniego dnia z grami w sezonie'),
  averageDap: z.number().describe('Średnia opóźniona, liczona z dapGames'),
});
export const RolesResponseSchema = z.object({
  season: z.number().int(),
  roles: z.array(RoleSummarySchema),
});
export const RoleResponseSchema = z.object({
  season: z.number().int(),
  role: RoleSummarySchema,
  overview: z.object({
    gamesPlayed: z.number().int(),
    totalAppearances: z.number().int(),
    wins: z.number().int(),
    winRate: z.number(),
  }),
  players: z.array(z.object({
    name: z.string(),
    gamesWithRole: z.number().int(),
    winsWithRole: z.number().int(),
    winRateWithRole: z.number(),
  })),
  topPerformances: z.array(z.object({
    gameId,
    date: z.string(),
    map: z.string(),
    duration: z.string(),
    playerName: z.string(),
    win: z.boolean(),
  })).describe('Najlepsze występy w kolejności ze strony roli, bez gier z ostatniego dnia z grami w sezonie'),
});

export const ErrorResponseSchema = z.object({ error: z.string() });

export const SettingsResponseSchema = z.object({
  current: z.string(),
  old: z.string().nullable(),
});
