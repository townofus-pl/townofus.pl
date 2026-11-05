import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { EVENT_TYPES, EVENT_TYPES_TEXT, ACTION_KEYS_TEXT, ACTION_COUNT_KEYS, CAUSE_KEYS_TEXT, SUBTYPE_ROLES } from './subtypes';
import { createSettingsSchema } from './settingsSchema';

extendZodWithOpenApi(z);

// Lista dozwolonych pól publicznego API. Każda odpowiedź przechodzi przez
// `Schema.parse(...)`, więc pole spoza schematu nigdy nie trafia do klienta,
// nawet gdy serwis zacznie je zwracać. Te same schematy opisują `/api/schema`.
// Nazwane struktury (`.openapi('Nazwa')`) trafiają do `components.schemas`, a odpowiedzi
// używają `$ref`. Każde pole odpowiedzi ma opis po polsku, a test pilnuje, żeby tak zostało.

const date = z.string().describe('Data sesji w formacie YYYYMMDD, np. 20261021');
const gameId = z.string().describe('Identyfikator gry w formacie YYYYMMDD_HHMM, np. 20261021_1106');
const seasonField = z.number().int().describe('Numer sezonu, którego dotyczy odpowiedź');

export const ErrorResponseSchema = z.object({
  error: z.string().describe('Opis błędu po polsku'),
}).openapi('Error', { description: 'Treść odpowiedzi z błędem (400, 404 albo 500).', example: { error: 'Nie znaleziono gry' } });

export const PairSchema = z.object({
  correct: z.number().describe('Liczba trafnych decyzji'),
  incorrect: z.number().describe('Liczba nietrafnych decyzji'),
}).openapi('CorrectIncorrect', { description: 'Para liczników: trafne i nietrafne.', example: { correct: 3, incorrect: 1 } });

export const AbilitySchema = z.object({
  name: z.string().describe('Nazwa zdolności po angielsku, jak w grze'),
  icon: z.string().describe('Ścieżka do ikony zdolności na stronie'),
}).openapi('Ability', { description: 'Zdolność użyta w akcji.', example: { name: 'Kill', icon: '/images/abilities/kill.png' } });

// --- Sezony i sesje -------------------------------------------------------

export const SeasonSchema = z.object({
  id: z.number().int().describe('Numer sezonu'),
  current: z.boolean().describe('Czy to bieżący sezon'),
  startDate: z.string().nullable().describe('Data początku sezonu (YYYY-MM-DD). null dla sezonu 2, który zaczyna się od początku danych'),
  endDate: z.string().nullable().describe('Data początku następnego sezonu, czyli koniec tego. null dla bieżącego sezonu'),
}).openapi('Season', { description: 'Sezon z przełącznika sezonu na stronie.', example: { id: 4, current: true, startDate: '2026-09-23', endDate: null } });
export const SeasonsResponseSchema = z.object({
  seasons: z.array(SeasonSchema).describe('Sezony od 2 wzwyż, w kolejności rosnącej'),
}).openapi('SeasonList', { description: 'Lista sezonów.' });

export const SessionSummarySchema = z.object({
  date,
  displayDate: z.string().describe('Data sesji do wyświetlenia po polsku, np. „21 października 2026”'),
  totalGames: z.number().int().describe('Liczba gier sesji. 0 dla daty, która ma tylko listę graczy sesji'),
  gameIds: z.array(gameId).describe('Identyfikatory gier sesji'),
  players: z.array(z.string()).describe('Nicki graczy, którzy zagrali w sesji'),
  hasSessionList: z.boolean().describe('Czy dla tej daty istnieje lista graczy sesji'),
}).openapi('SessionSummary', {
  description: 'Sesja (dzień z grami) z listy historii gier.',
  example: { date: '20261021', displayDate: '21 października 2026', totalGames: 2, gameIds: ['20261021_1106', '20261021_1129'], players: ['Gracz1', 'Gracz2'], hasSessionList: false },
});
export const SessionsResponseSchema = z.object({
  season: seasonField,
  sessions: z.array(SessionSummarySchema).describe('Sesje od najnowszej'),
}).openapi('SessionList', { description: 'Lista sesji sezonu.' });

export const GameSummarySchema = z.object({
  id: gameId,
  date,
  gameNumber: z.number().int().describe('Numer gry w dniu, od 1 dla najstarszej gry dnia'),
  duration: z.string().describe('Czas trwania gry w formacie m:ss'),
  players: z.number().int().describe('Liczba graczy w grze'),
  winner: z.string().describe('Zwycięzca: Crewmate, Impostor albo nazwa roli neutralnej'),
  winCondition: z.string().describe('Opis warunku wygranej'),
  map: z.string().describe('Nazwa mapy'),
  winnerNames: z.array(z.string()).describe('Nicki zwycięzców'),
  allPlayerNames: z.array(z.string()).describe('Nicki wszystkich graczy gry'),
}).openapi('GameSummary', {
  description: 'Skrót gry z listy gier.',
  example: { id: '20261021_1106', date: '20261021', gameNumber: 1, duration: '12:08', players: 15, winner: 'Crewmate', winCondition: 'Crewmate won', map: 'Polus', winnerNames: ['Gracz1'], allPlayerNames: ['Gracz1', 'Gracz2'] },
});
export const GamesResponseSchema = z.object({
  season: seasonField,
  total: z.number().int().describe('Liczba gier pasujących do filtra, przed podziałem na strony'),
  limit: z.number().int().describe('Użyty limit gier na stronę'),
  offset: z.number().int().describe('Użyte przesunięcie od początku listy'),
  games: z.array(GameSummarySchema).describe('Gry tej strony od najnowszej'),
}).openapi('GameList', { description: 'Strona listy gier sezonu.' });

const WinLossSchema = z.enum(['W', 'L']).nullable();
const resultsField = z.array(WinLossSchema).describe('Wynik w każdej grze sesji, od najstarszej: W wygrana, L przegrana, null gdy nie grał');

export const SessionPlayerSchema = z.object({
  player: z.string().describe('Nick gracza'),
  gamesPlayed: z.number().int().describe('Liczba gier gracza w sesji'),
  wins: z.number().int().describe('Liczba wygranych'),
  losses: z.number().int().describe('Liczba przegranych'),
  winRate: z.number().describe('Procent wygranych, do 2 miejsc po przecinku'),
  results: resultsField,
}).openapi('SessionPlayer', { description: 'Wyniki gracza w sesji.', example: { player: 'Gracz1', gamesPlayed: 3, wins: 2, losses: 1, winRate: 66.67, results: ['W', null, 'L', 'W'] } });
export const SessionRoleSchema = z.object({
  name: z.string().describe('Nazwa roli w rejestrze ról'),
  displayName: z.string().describe('Nazwa roli do wyświetlenia'),
  team: z.string().describe('Drużyna roli: Crewmate, Impostor albo Neutral'),
  gamesPlayed: z.number().int().describe('Liczba występów graczy z tą rolą początkową'),
  wins: z.number().int().describe('Liczba wygranych z tą rolą'),
  losses: z.number().int().describe('Liczba przegranych z tą rolą'),
  winRate: z.number().describe('Procent wygranych, do 2 miejsc po przecinku'),
  results: resultsField,
}).openapi('SessionRole', { description: 'Wyniki roli w sesji. Rolą jest rola początkowa gracza.', example: { name: 'Sheriff', displayName: 'Sheriff', team: 'Crewmate', gamesPlayed: 2, wins: 1, losses: 1, winRate: 50, results: ['W', 'L'] } });
export const SessionListPlayerSchema = z.object({
  player: z.string().describe('Nick gracza z listy sesji'),
  rating: z.number().nullable().describe('Rating gracza w tym sezonie, zaokrąglony. null, gdy gracz nie ma ratingu'),
});
export const SessionResponseSchema = z.object({
  season: seasonField,
  date,
  displayDate: z.string().describe('Data sesji do wyświetlenia po polsku'),
  totalGames: z.number().int().describe('Liczba gier sesji'),
  crewmateWins: z.number().int().describe('Liczba gier wygranych przez Crewmate'),
  impostorWins: z.number().int().describe('Liczba gier wygranych przez Impostor'),
  neutralWins: z.number().int().describe('Liczba gier wygranych przez role neutralne'),
  games: z.array(GameSummarySchema).describe('Gry sesji od najstarszej'),
  players: z.array(SessionPlayerSchema).describe('Wyniki graczy, od najlepszego procentu wygranych'),
  roles: z.array(SessionRoleSchema).describe('Wyniki ról, od najlepszego procentu wygranych'),
  sessionList: z.object({
    players: z.array(SessionListPlayerSchema).describe('Gracze z listy sesji, od najwyższego ratingu'),
  }).nullable().describe('Lista graczy sesji, jeśli ją opublikowano. null, gdy jej nie ma'),
}).openapi('Session', { description: 'Wyniki jednej sesji: gry, gracze i role.' });

// --- Liczniki -----------------------------------------------------------------

const NO_ACTION_DATA = 'Pole ma null, gdy gra nie ma danych akcji.';

// Grupy jak na stronie (funkcja `categorize()` w `statsBreakdown.ts`), więc sumy w API
// zgadzają się z liczbami na stronie. `types` rozkłada grupę na rodzaje akcji.
export const KillCountersSchema = z.object({
  correct: z.number().describe('Liczba trafnych zabójstw, egzekucji i strzałów w grupie'),
  incorrect: z.number().describe('Liczba nietrafnych zabójstw, egzekucji i strzałów w grupie'),
  types: z.object({
    standard: PairSchema,
    jailorExecutes: PairSchema,
    deputyShoots: PairSchema,
  }).describe(
    `Rozkład grupy na rodzaje zabójstw. standard: zabójstwa dowolnej roli poza Jailor, Deputy i Prosecutor (lista ról otwarta, np. Crewpostor). jailorExecutes: egzekucje (${SUBTYPE_ROLES.kills.jailorExecutes.join(', ')}). deputyShoots: strzały (${SUBTYPE_ROLES.kills.deputyShoots.join(', ')}).`,
  ),
}).openapi('KillCounters', { description: 'Zabójstwa, egzekucje Jailora i strzały Deputy.' });

export const GuessCountersSchema = z.object({
  correct: z.number().describe('Liczba trafnych zgadnięć'),
  incorrect: z.number().describe('Liczba nietrafnych zgadnięć'),
  types: z.object({
    roles: PairSchema,
    modifiers: PairSchema,
  }).nullable().describe(
    `Rozkład na zgadywanie ról i modyfikatorów. roles: zgadnięcie z nazwaną rolą (guessedRole). modifiers: zgadnięcie z nazwanym modyfikatorem (guessedModifier). Zgadnięcia bez żadnego z tych pól, w starszych grach, są tylko w sumie grupy. ${NO_ACTION_DATA}`,
  ),
}).openapi('GuessCounters', { description: 'Zgadywanie ról i modyfikatorów. Zgadują Vigilante, modyfikator Assassin i Doomsayer. Modyfikator Double Shot daje zgadywanie każdej roli, więc lista ról jest otwarta.' });

export const ProtectCountersSchema = z.object({
  correct: z.number().describe('Liczba trafnych ochron'),
  incorrect: z.number().describe('Liczba nietrafnych ochron'),
  types: z.object({
    medic: PairSchema,
    mirrorcaster: PairSchema,
    oracle: PairSchema,
    warden: PairSchema,
  }).describe(
    'Ochrony według roli (medic, mirrorcaster, oracle, warden). Źródło zależy od sezonu. Sezony 2-3: stare kolumny liczników. medic pochodzi z ochron (w sezonach 2-3 to tylko dane Medica), warden z wzmocnień Wardena, mirrorcaster i oracle mają 0. Sezon 4 i późniejsze: akcje protect z game_actions, według roli wykonawcy. Ochrony Monarcha są w other.types.knights.',
  ),
}).openapi('ProtectCounters', { description: 'Ochrony. Dla sezonów 2-3 dane są podane w formacie sezonu 4. Strona pokazuje te sezony inaczej, więc liczby wardena mogą się różnić od strony.' });

export const OtherCountersSchema = z.object({
  correct: z.number().describe('Liczba trafnych akcji z grupy. Czyszczenie ciał Janitora liczy się tutaj'),
  incorrect: z.number().describe('Liczba nietrafnych akcji z grupy'),
  types: z.object({
    prosecutes: PairSchema,
    altruistRevives: PairSchema,
    swaps: PairSchema,
    janitorCleans: z.number().describe(`Liczba czyszczeń ciał (${SUBTYPE_ROLES.other.janitorCleans.join(', ')}), bez podziału na correct i incorrect`),
    knights: PairSchema,
  }).describe(
    `Rozkład grupy na rodzaje akcji. prosecutes: oskarżenia (${SUBTYPE_ROLES.other.prosecutes.join(', ')}). altruistRevives: wskrzeszenia (${SUBTYPE_ROLES.other.altruistRevives.join(', ')}). swaps: zamiany głosów (${SUBTYPE_ROLES.other.swaps.join(', ')}). knights: pasowanie rycerzy przez ${SUBTYPE_ROLES.other.knights.join(', ')}.`,
  ),
}).openapi('OtherCounters', { description: 'Pozostałe akcje. Czyszczenie ciał Janitora liczy się w correct tej grupy.' });

export const VoteCountersSchema = PairSchema.nullable().openapi('VoteCounters', {
  description: `Trafne i nietrafne głosy gracza. Głos z wagą (np. Mayor) liczy się tyle razy, ile wynosi waga. ${NO_ACTION_DATA}`,
});

export const CountersSchema = z.object({
  kills: KillCountersSchema,
  guesses: GuessCountersSchema,
  protects: ProtectCountersSchema,
  other: OtherCountersSchema,
  votes: VoteCountersSchema,
}).openapi('Counters', {
  description: 'Liczniki gracza w grupach strony: zabójstwa, zgadywanie, ochrony, pozostałe akcje i głosy.',
  example: {
    kills: { correct: 2, incorrect: 0, types: { standard: { correct: 2, incorrect: 0 }, jailorExecutes: { correct: 0, incorrect: 0 }, deputyShoots: { correct: 0, incorrect: 0 } } },
    guesses: { correct: 1, incorrect: 1, types: { roles: { correct: 1, incorrect: 1 }, modifiers: { correct: 0, incorrect: 0 } } },
    protects: { correct: 3, incorrect: 0, types: { medic: { correct: 3, incorrect: 0 }, mirrorcaster: { correct: 0, incorrect: 0 }, oracle: { correct: 0, incorrect: 0 }, warden: { correct: 0, incorrect: 0 } } },
    other: { correct: 1, incorrect: 0, types: { prosecutes: { correct: 0, incorrect: 0 }, altruistRevives: { correct: 0, incorrect: 0 }, swaps: { correct: 0, incorrect: 0 }, janitorCleans: 1, knights: { correct: 0, incorrect: 0 } } },
    votes: { correct: 4, incorrect: 2 },
  },
});

export const PlayerActionsSchema = z.record(z.enum(ACTION_COUNT_KEYS), z.number().describe('Liczba akcji tego typu')).nullable().openapi('PlayerActions', {
  description: `Liczba akcji bez licznika w counters, dla jednego gracza. Klucze (lista zamknięta): ${ACTION_KEYS_TEXT}. ${NO_ACTION_DATA}`,
  example: { vent_use: 3, ability_used: 5 },
});

// --- Gry ----------------------------------------------------------------------

export const GamePlayerSchema = z.object({
  player: z.string().describe('Nick gracza'),
  role: z.string().describe('Rola początkowa gracza'),
  roleHistory: z.array(z.string()).describe('Role gracza w kolejności, także po zmianie roli w trakcie gry'),
  modifiers: z.array(z.string()).describe('Modyfikatory gracza w grze'),
  team: z.string().describe('Drużyna roli początkowej: Crewmate, Impostor albo Neutral'),
  win: z.boolean().describe('Czy gracz wygrał grę'),
  survived: z.boolean().describe('false, gdy gracz rozłączył się z gry'),
  completedTasks: z.number().describe('Liczba wykonanych zadań'),
  survivedRounds: z.number().default(0).describe('Liczba przetrwanych rund'),
  counters: CountersSchema,
  actions: PlayerActionsSchema,
}).openapi('GamePlayer', { description: 'Gracz w jednej grze.' });

export const MeetingSchema = z.object({
  meetingNumber: z.number().int().describe('Numer spotkania w grze, od 1'),
  exiledPlayer: z.string().nullable().optional().describe('Nick gracza wyrzuconego w głosowaniu. null, gdy nikogo nie wyrzucono. Brak pola w starszych grach'),
  deathsSinceLastMeeting: z.array(z.string()).describe('Opisy śmierci od poprzedniego spotkania, jak zapisała gra'),
  deathsDuringMeeting: z.array(z.string()).optional().describe('Nicki graczy, którzy zginęli w trakcie spotkania'),
  votes: z.record(z.string(), z.array(z.string())).describe('Głosy: nick celu, a w tablicy nicki głosujących'),
  skipVotes: z.array(z.string()).describe('Nicki graczy, którzy pominęli głosowanie'),
  noVotes: z.array(z.string()).describe('Nicki graczy, którzy nie oddali głosu'),
  blackmailedPlayers: z.array(z.string()).optional().describe('Nicki graczy uciszonych szantażem na tym spotkaniu'),
  jailedPlayers: z.array(z.string()).optional().describe('Nicki graczy uwięzionych na tym spotkaniu'),
  wasTie: z.boolean().describe('Czy głosowanie zakończyło się remisem'),
  wasBlessed: z.boolean().describe('Czy spotkanie było pod błogosławieństwem'),
}).openapi('Meeting', { description: 'Spotkanie w grze: głosy i wyniki głosowania.' });

export const GameResponseSchema = z.object({
  season: z.number().int().nullable().describe('Numer sezonu gry'),
  id: gameId,
  date,
  startTime: z.string().describe('Początek gry, czas ISO 8601'),
  endTime: z.string().describe('Koniec gry, czas ISO 8601'),
  duration: z.string().describe('Czas trwania gry w formacie m:ss'),
  map: z.string().describe('Nazwa mapy'),
  winner: z.string().describe('Zwycięzca: Crewmate, Impostor albo nazwa roli neutralnej'),
  winCondition: z.string().describe('Opis warunku wygranej'),
  winnerNames: z.array(z.string()).describe('Nicki zwycięzców'),
  maxTasks: z.number().int().nullable().describe('Liczba zadań w grze, jeśli znana'),
  players: z.array(GamePlayerSchema).describe(
    'Gracze w kolejności ze strony gry. Gra z ostatniego dnia z grami w sezonie: alfabetycznie. Starsza gra: kolejność „Standardowo”.',
  ),
  meetings: z.array(MeetingSchema).describe('Spotkania gry od pierwszego'),
  hasTimeline: z.boolean().describe('Czy gra ma oś czasu. Zdarzenia są pod /api/v2/games/{id}/events. Gdy jest false, pola votes, actions i guesses.types mają null.'),
}).openapi('Game', {
  description: 'Szczegóły jednej gry bez zdarzeń: gracze z licznikami i spotkania.',
});

export const GameEventSchema = z.object({
  timestamp: z.string().describe('Czas od początku meczu, mm:ss'),
  type: z.enum(EVENT_TYPES).describe(
    `Dokładny typ akcji (lista zamknięta): ${EVENT_TYPES_TEXT}. Oś czasu ukrywa typy modifier_gained, modifier_lost i win oraz pierwsze role_assigned każdego gracza.`,
  ),
  player: z.string().describe('Nick gracza wykonującego akcję'),
  playerRole: z.string().optional().describe('Rola wykonawcy w chwili akcji'),
  target: z.string().optional().describe('Nick celu akcji, jeśli akcja ma cel'),
  targetRole: z.string().optional().describe('Rola celu w chwili akcji'),
  actionLabel: z.string().optional().describe('Opis akcji po polsku, np. „zabił”'),
  isCorrect: z.boolean().nullable().optional().describe('Czy akcja była trafna. null, gdy gra nie mogła tego ocenić'),
  causeOfDeath: z.string().optional().describe(
    `Przyczyna śmierci (zabójstwa i śmierci). Surowy klucz z gry, niezależny od języka. Lista jest otwarta i może rosnąć. Znane klucze: ${CAUSE_KEYS_TEXT}. Starsze gry możliwe, że nie mają tego pola.`,
  ),
  isGuess: z.boolean().optional().describe('Czy zabójstwo było zgadywaniem. Starsze gry możliwe, że nie mają tego pola.'),
  guessedRole: z.string().optional().describe('Rola nazwana przy zgadywaniu. Starsze gry możliwe, że nie mają tego pola.'),
  guessedModifier: z.string().optional().describe('Modyfikator nazwany przy zgadywaniu. Starsze gry możliwe, że nie mają tego pola.'),
  ability: AbilitySchema.optional().describe('Zdolność użyta w akcji, także przy zabójstwie'),
  survivors: z.array(z.object({
    name: z.string().describe('Nick gracza, który przetrwał rundę'),
    role: z.string().optional().describe('Rola gracza'),
    color: z.string().optional().describe('Kolor roli, wartość CSS'),
  })).optional().describe('Gracze, którzy przetrwali rundę (zdarzenie round_survived)'),
}).openapi('GameEvent', {
  description: 'Zdarzenie na osi czasu gry.',
  example: { timestamp: '04:12', type: 'kill', player: 'Gracz1', playerRole: 'Impostor', target: 'Gracz2', targetRole: 'Sheriff', actionLabel: 'zabił', isCorrect: true, causeOfDeath: 'Guess', isGuess: true, guessedRole: 'Sheriff' },
});

export const GameEventsResponseSchema = z.object({
  id: gameId,
  events: z.array(GameEventSchema).describe(
    'Zdarzenia tej gry. Są czytane osobno dla każdej gry i mają ten sam filtr ukrytych akcji co oś czasu na stronie gry.',
  ),
}).openapi('GameEvents', { description: 'Oś czasu jednej gry.' });

// --- Ranking i gracze -------------------------------------------------------------

export const RankingPlayerSchema = z.object({
  rank: z.number().int().describe('Miejsce w rankingu, od 1'),
  player: z.string().describe('Nick gracza'),
  rating: z.number().describe('Bieżący rating gracza w sezonie'),
  dap: z.number().describe('Wartość opóźniona: bez ostatniego dnia z grami w sezonie'),
  gamesPlayed: z.number().int().describe('Liczba gier gracza w sezonie'),
  wins: z.number().int().describe('Liczba wygranych'),
  losses: z.number().int().describe('Liczba przegranych'),
  winRate: z.number().describe('Procent wygranych, do 2 miejsc po przecinku'),
  lastUpdated: z.string().describe('Czas ostatniej zmiany ratingu, ISO 8601'),
}).openapi('RankingPlayer', { description: 'Wiersz rankingu sezonu.', example: { rank: 1, player: 'Gracz1', rating: 2150.5, dap: 12.4, gamesPlayed: 30, wins: 18, losses: 12, winRate: 60, lastUpdated: '2026-10-21T21:30:00.000Z' } });
export const RankingResponseSchema = z.object({
  season: seasonField,
  limit: z.number().int().describe('Użyty limit wierszy'),
  offset: z.number().int().describe('Użyte przesunięcie od początku rankingu'),
  emperor: z.string().nullable().describe('Cesarz pokazany na stronie rankingu. null, gdy go nie ma'),
  players: z.array(RankingPlayerSchema).describe('Gracze od najwyższego ratingu'),
}).openapi('Ranking', { description: 'Ranking sezonu.' });

export const PlayerStatsSchema = z.object({
  gamesPlayed: z.number().int().describe('Liczba gier gracza w sezonie'),
  wins: z.number().int().describe('Liczba wygranych'),
  winRate: z.number().describe('Procent wygranych, zaokrąglony do całości'),
  impostorGames: z.number().int().describe('Liczba gier z rolą początkową Impostor'),
  crewmateGames: z.number().int().describe('Liczba gier z rolą początkową Crewmate'),
  neutralGames: z.number().int().describe('Liczba gier z rolą początkową neutralną'),
  completedTasks: z.number().describe('Liczba wykonanych zadań'),
  maxTasks: z.number().describe('Suma zadań w grach, w których gracz zaczynał jako Crewmate'),
  survivedRounds: z.number().describe('Liczba przetrwanych rund'),
  totalRounds: z.number().describe('Przetrwane rundy plus 1 za każdą przegraną grę'),
  counters: CountersSchema,
}).openapi('PlayerStats', { description: 'Statystyki gracza w sezonie.' });

export const RoleBreakdownEntrySchema = z.object({
  gamesPlayed: z.number().int().describe('Liczba gier gracza w tej roli'),
  counters: CountersSchema,
}).openapi('RoleBreakdownEntry', { description: 'Liczniki gracza dla jednej roli (rola końcowa w grze).' });

export const RatingHistoryEntrySchema = z.object({
  date: z.string().describe('Czas gry albo zmiany ratingu, ISO 8601'),
  rating: z.number().describe('Rating gracza po tej zmianie'),
  reason: z.string().nullable().describe('Powód zmiany: base_value, initial_value, game_result, absence_penalty, absence_no_penalty, penalty, reward albo season_reset. null, gdy brak'),
  gameId: gameId.nullable().describe('Gra, która zmieniła rating. null dla zmian bez gry'),
}).openapi('RatingHistoryEntry', { description: 'Wpis historii ratingu gracza.', example: { date: '2026-10-21T21:30:00.000Z', rating: 2150.5, reason: 'game_result', gameId: '20261021_1106' } });

export const BestGameSchema = z.object({
  gameId,
  date: z.string().describe('Początek gry, ISO 8601'),
  map: z.string().describe('Nazwa mapy'),
  duration: z.string().describe('Czas trwania gry w formacie m:ss'),
  role: z.string().describe('Rola początkowa gracza w grze'),
  team: z.string().describe('Drużyna roli: Crewmate, Impostor albo Neutral'),
  win: z.boolean().describe('Czy gracz wygrał grę'),
}).openapi('BestGame', { description: 'Jedna z najlepszych gier gracza.' });

export const VotingRelationSchema = z.object({
  player: z.string().describe('Nick drugiego gracza'),
  voteCount: z.number().describe('Liczba głosów między graczami'),
  percentage: z.number().describe('Udział tych głosów w głosach gracza, w procentach'),
}).openapi('VotingRelation', { description: 'Głosy między graczem a innym graczem.' });

export const VotingStatsSchema = z.object({
  totalVotesCast: z.number().describe('Ile razy gracz zagłosował na kogokolwiek'),
  totalVotesReceived: z.number().describe('Ile razy inni zagłosowali na gracza'),
  timesVotedOut: z.number().describe('Ile razy gracz został wyrzucony w głosowaniu'),
  totalMeetings: z.number().describe('Liczba spotkań, w których gracz brał udział'),
  skipVotes: z.number().describe('Ile razy gracz pominął głosowanie'),
  skipRate: z.number().describe('Procent spotkań z pominięciem głosowania'),
  bandwagonFactor: z.number().describe('Jak często gracz głosuje z większością, w procentach (0-100)'),
  votingTargets: z.array(VotingRelationSchema).describe('Gracze, na których gracz głosował najczęściej'),
  votedByPlayers: z.array(VotingRelationSchema).describe('Gracze, którzy głosowali na gracza najczęściej'),
}).openapi('VotingStats', { description: 'Statystyki głosowań gracza w sezonie.' });

export const PlayerResponseSchema = z.object({
  season: seasonField,
  name: z.string().describe('Nick gracza'),
  stars: z.number().int().describe('Liczba gwiazdek gracza pokazana na stronie gracza'),
  rating: z.number().nullable().describe('Bieżący rating gracza w sezonie (ostatni wpis historii). null, gdy brak historii'),
  stats: PlayerStatsSchema,
  roleBreakdown: z.record(z.string(), RoleBreakdownEntrySchema).optional().describe('Liczniki gracza według roli. Tylko sezon 4 i późniejsze'),
  ratingHistory: z.array(RatingHistoryEntrySchema).describe('Historia ratingu od najstarszego wpisu'),
  bestGames: z.array(BestGameSchema).describe('Najlepsze gry gracza w kolejności ze strony gracza. Parametry limit i offset dzielą listę na strony.'),
  hasMoreBestGames: z.boolean().describe('Czy lista ma następną stronę najlepszych gier'),
  voting: VotingStatsSchema,
}).openapi('Player', { description: 'Profil gracza w sezonie.' });

// --- Role ---------------------------------------------------------------------

export const RoleSummarySchema = z.object({
  name: z.string().describe('Nazwa roli w rejestrze ról'),
  displayName: z.string().describe('Nazwa roli do wyświetlenia'),
  color: z.string().describe('Kolor roli, wartość CSS'),
  team: z.string().describe('Drużyna roli: Crewmate, Impostor albo Neutral'),
  gamesPlayed: z.number().int().describe('Liczba występów graczy z tą rolą początkową w sezonie'),
  wins: z.number().int().describe('Liczba wygranych z tą rolą'),
  winRate: z.number().describe('Procent wygranych, jedno miejsce po przecinku'),
  dapGames: z.number().int().describe('Liczba rozgrywek wliczonych do wartości DAP'),
  dap: z.number().describe('Wartość opóźniona: bez ostatniego dnia z grami w sezonie'),
  averageDap: z.number().describe('Średnia opóźniona, liczona z dapGames'),
}).openapi('RoleSummary', { description: 'Wiersz tabeli ról sezonu.', example: { name: 'Sheriff', displayName: 'Sheriff', color: '#FFCC80', team: 'Crewmate', gamesPlayed: 40, wins: 22, winRate: 55, dapGames: 36, dap: 120.5, averageDap: 3.3 } });
export const RolesResponseSchema = z.object({
  season: seasonField,
  roles: z.array(RoleSummarySchema).describe('Role z występami w sezonie'),
}).openapi('RoleList', { description: 'Tabela ról sezonu.' });

export const RolePlayerSchema = z.object({
  player: z.string().describe('Nick gracza'),
  gamesPlayed: z.number().int().describe('Liczba gier gracza z tą rolą początkową'),
  wins: z.number().int().describe('Liczba wygranych z tą rolą'),
  winRate: z.number().describe('Procent wygranych z tą rolą, jedno miejsce po przecinku'),
}).openapi('RolePlayer', { description: 'Wyniki jednego gracza w tej roli.' });

export const TopPerformanceSchema = z.object({
  gameId,
  date: z.string().describe('Data gry w formacie YYYYMMDD'),
  map: z.string().describe('Nazwa mapy'),
  duration: z.string().describe('Czas trwania gry w formacie m:ss'),
  player: z.string().describe('Nick gracza'),
  win: z.boolean().describe('Czy gracz wygrał grę'),
}).openapi('TopPerformance', { description: 'Jeden z najlepszych występów w roli.' });

export const RoleResponseSchema = z.object({
  season: seasonField,
  role: RoleSummarySchema.extend({
    totalAppearances: z.number().int().describe('Występy graczy w tej roli w całej historii roli, także po zmianie roli'),
  }).openapi('RoleDetails', { description: 'Wiersz roli z tabeli ról i liczba występów w całej historii roli.' }),
  players: z.array(RolePlayerSchema).describe('Gracze z tą rolą początkową, od najlepszego procentu wygranych'),
  topPerformances: z.array(TopPerformanceSchema).describe('Najlepsze występy w kolejności ze strony roli'),
}).openapi('Role', { description: 'Szczegóły jednej roli w sezonie.' });

// --- Inne -----------------------------------------------------------------------

export const SettingsResponseSchema = createSettingsSchema().openapi('Settings', {
  description: 'Pliki ustawień gry, które pokazują strona ustawień i changelog.',
});
