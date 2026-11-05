import { z } from 'zod';
import { EVENT_TYPES, EVENT_TYPES_TEXT, ACTION_KEYS_TEXT, ACTION_COUNT_KEYS, CAUSE_KEYS_TEXT, SUBTYPE_ROLES } from './subtypes';

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
  player: z.string(),
  gamesPlayed: z.number().int(),
  wins: z.number().int(),
  losses: z.number().int(),
  winRate: z.number(),
  results: z.array(WinLossSchema),
});
export const SessionRoleSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  team: z.string(),
  gamesPlayed: z.number().int(),
  wins: z.number().int(),
  losses: z.number().int(),
  winRate: z.number(),
  results: z.array(WinLossSchema),
});
export const SessionListPlayerSchema = z.object({
  player: z.string(),
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

const NO_ACTION_DATA = 'Pole ma null, gdy gra nie ma danych akcji.';

// Grupy jak na stronie (funkcja `categorize()` w `statsBreakdown.ts`), więc sumy w API
// zgadzają się z liczbami na stronie. `types` rozkłada grupę na rodzaje akcji.
export const CountersSchema = z.object({
  kills: PairSchema.extend({
    types: pairs(['standard', 'jailorExecutes', 'deputyShoots'] as const).describe(
      `standard: zabójstwa dowolnej roli poza Jailor, Deputy i Prosecutor (lista ról otwarta, np. Crewpostor). jailorExecutes: ${SUBTYPE_ROLES.kills.jailorExecutes.join(', ')}. deputyShoots: ${SUBTYPE_ROLES.kills.deputyShoots.join(', ')}.`,
    ),
  }).describe('Zabójstwa, egzekucje Jailora i strzały Deputy.'),
  guesses: PairSchema.extend({
    types: z.object({ roles: PairSchema, modifiers: PairSchema }).nullable().describe(
      `roles: zgadnięcie z nazwaną rolą (guessedRole). modifiers: zgadnięcie z nazwanym modyfikatorem (guessedModifier). Zgadnięcia bez żadnego z tych pól, w starszych grach, są tylko w sumie grupy. ${NO_ACTION_DATA}`,
    ),
  }).describe('Zgadywanie ról i modyfikatorów. Zgadują Vigilante, modyfikator Assassin i Doomsayer. Modyfikator Double Shot daje zgadywanie każdej roli, więc lista ról jest otwarta.'),
  protects: PairSchema.extend({
    types: pairs(['medic', 'mirrorcaster', 'oracle', 'warden'] as const).describe(
      'Ochrony według roli: Medic, Mirrorcaster, Oracle, Warden. Źródło zależy od sezonu. Sezony 2-3: stare kolumny liczników. medic pochodzi z ochron (w sezonach 2-3 to tylko dane Medica), warden z wzmocnień Wardena, mirrorcaster i oracle mają 0. Sezon 4 i późniejsze: akcje protect z game_actions, według roli wykonawcy. Ochrony Monarcha są w other.types.knights.',
    ),
  }).describe('Ochrony. Dla sezonów 2-3 dane są podane w formacie sezonu 4. Strona pokazuje te sezony inaczej, więc liczby wardena mogą się różnić od strony.'),
  other: PairSchema.extend({
    types: z.object({
      prosecutes: PairSchema,
      altruistRevives: PairSchema,
      swaps: PairSchema,
      janitorCleans: z.number(),
      knights: PairSchema,
    }).describe(
      `prosecutes: ${SUBTYPE_ROLES.other.prosecutes.join(', ')}. altruistRevives: ${SUBTYPE_ROLES.other.altruistRevives.join(', ')}. swaps: ${SUBTYPE_ROLES.other.swaps.join(', ')}. janitorCleans: liczba czyszczeń ciał (${SUBTYPE_ROLES.other.janitorCleans.join(', ')}), bez podziału na correct i incorrect. knights: pasowanie rycerzy przez ${SUBTYPE_ROLES.other.knights.join(', ')}.`,
    ),
  }).describe('Pozostałe akcje. Czyszczenie ciał Janitora liczy się w correct tej grupy.'),
  votes: PairSchema.nullable().describe(`Głosy. ${NO_ACTION_DATA}`),
});

export const GamePlayerSchema = z.object({
  player: z.string(),
  role: z.string(),
  roleHistory: z.array(z.string()),
  modifiers: z.array(z.string()),
  team: z.string(),
  win: z.boolean(),
  survived: z.boolean(),
  completedTasks: z.number(),
  survivedRounds: z.number().default(0),
  counters: CountersSchema,
  actions: z.record(z.enum(ACTION_COUNT_KEYS), z.number()).nullable().describe(
    `Liczba akcji bez licznika w counters, dla tego gracza. Klucze (lista zamknięta): ${ACTION_KEYS_TEXT}. ${NO_ACTION_DATA}`,
  ),
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

const AbilitySchema = z.object({ name: z.string(), icon: z.string() });

const GameEventSchema = z.object({
  timestamp: z.string().describe('Czas od początku meczu, mm:ss'),
  type: z.enum(EVENT_TYPES).describe(
    `Dokładny typ akcji (lista zamknięta): ${EVENT_TYPES_TEXT}. Oś czasu ukrywa typy modifier_gained, modifier_lost i win oraz pierwsze role_assigned każdego gracza.`,
  ),
  player: z.string(),
  playerRole: z.string().optional(),
  target: z.string().optional(),
  targetRole: z.string().optional(),
  actionLabel: z.string().optional().describe('Opis akcji po polsku, np. „zabił”'),
  isCorrect: z.boolean().nullable().optional(),
  causeOfDeath: z.string().optional().describe(
    `Przyczyna śmierci (zabójstwa i śmierci). Surowy klucz z gry, niezależny od języka. Lista jest otwarta i może rosnąć. Znane klucze: ${CAUSE_KEYS_TEXT}. Starsze gry możliwe, że nie mają tego pola.`,
  ),
  isGuess: z.boolean().optional().describe('Czy zabójstwo było zgadywaniem. Starsze gry możliwe, że nie mają tego pola.'),
  guessedRole: z.string().optional().describe('Rola nazwana przy zgadywaniu. Starsze gry możliwe, że nie mają tego pola.'),
  guessedModifier: z.string().optional().describe('Modyfikator nazwany przy zgadywaniu. Starsze gry możliwe, że nie mają tego pola.'),
  ability: AbilitySchema.optional().describe('Zdolność użyta w akcji, także przy zabójstwie'),
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
  hasTimeline: z.boolean().describe('Czy gra ma oś czasu. Zdarzenia są pod /api/v2/games/{id}/events. Gdy jest false, pola votes, actions i guesses.types mają null.'),
});

export const GameEventsResponseSchema = z.object({
  id: gameId,
  events: z.array(GameEventSchema).describe(
    'Zdarzenia tej gry. Są czytane osobno dla każdej gry i mają ten sam filtr ukrytych akcji co oś czasu na stronie gry.',
  ),
});

export const RankingPlayerSchema = z.object({
  rank: z.number().int(),
  player: z.string(),
  rating: z.number(),
  dap: z.number().describe('Wartość opóźniona: bez ostatniego dnia z grami w sezonie'),
  gamesPlayed: z.number().int(),
  wins: z.number().int(),
  losses: z.number().int(),
  winRate: z.number(),
  lastUpdated: z.string(),
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
    completedTasks: z.number(),
    maxTasks: z.number(),
    survivedRounds: z.number(),
    totalRounds: z.number(),
    counters: CountersSchema,
  }),
  roleBreakdown: z.record(z.string(), z.object({
    gamesPlayed: z.number().int(),
    counters: CountersSchema,
  })).optional().describe('Liczniki gracza według roli, ten sam kształt co counters'),
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
  })).describe('Najlepsze gry gracza w kolejności ze strony gracza. Parametry limit i offset dzielą listę na strony.'),
  hasMoreBestGames: z.boolean(),
  voting: z.object({
    totalVotesCast: z.number(),
    totalVotesReceived: z.number(),
    timesVotedOut: z.number(),
    totalMeetings: z.number(),
    skipVotes: z.number(),
    skipRate: z.number(),
    bandwagonFactor: z.number(),
    votingTargets: z.array(z.object({ player: z.string(), voteCount: z.number(), percentage: z.number() })),
    votedByPlayers: z.array(z.object({ player: z.string(), voteCount: z.number(), percentage: z.number() })),
  }),
});

export const RoleSummarySchema = z.object({
  name: z.string(),
  displayName: z.string(),
  color: z.string(),
  team: z.string(),
  gamesPlayed: z.number().int(),
  wins: z.number().int(),
  winRate: z.number().describe('Procent wygranych, jedno miejsce po przecinku'),
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
  role: RoleSummarySchema.extend({
    totalAppearances: z.number().int().describe('Występy gracza w tej roli w całej historii roli, także po zmianie roli'),
  }),
  players: z.array(z.object({
    player: z.string(),
    gamesPlayed: z.number().int(),
    wins: z.number().int(),
    winRate: z.number(),
  })),
  topPerformances: z.array(z.object({
    gameId,
    date: z.string(),
    map: z.string(),
    duration: z.string(),
    player: z.string(),
    win: z.boolean(),
  })).describe('Najlepsze występy w kolejności ze strony roli'),
});

export const ErrorResponseSchema = z.object({ error: z.string() });

export const SettingsResponseSchema = z.object({
  current: z.string(),
  old: z.string().nullable(),
});
