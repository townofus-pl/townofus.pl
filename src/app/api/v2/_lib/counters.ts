import { FIRST_MIRA_SEASON } from '@/app/dramaafera/_constants/seasons';
import { normalizeRoleName } from '@/app/dramaafera/_utils/gameUtils';

// Liczniki w kształcie `CountersSchema`. Grupy są takie jak w `categorize()`
// (`statsBreakdown.ts`), z jedną różnicą: API ma format sezonu 4 dla każdego sezonu,
// więc wzmocnienia Wardena (kolumny `*WardenFortifies`) są zawsze w grupie `protects`.
// Strona sezonów 2-3 pokazuje je w grupie `other`. Nie zmieniamy strony.

export interface Pair { correct: number; incorrect: number }

/** Sumy kolumn liczników z bazy. Brakujące kolumny to 0. */
export type CounterColumns = Partial<Record<
  | 'correctKills' | 'incorrectKills' | 'correctGuesses' | 'incorrectGuesses'
  | 'correctProsecutes' | 'incorrectProsecutes' | 'correctDeputyShoots' | 'incorrectDeputyShoots'
  | 'correctJailorExecutes' | 'incorrectJailorExecutes' | 'correctProtects' | 'incorrectProtects'
  | 'correctWardenFortifies' | 'incorrectWardenFortifies' | 'janitorCleans'
  | 'correctAltruistRevives' | 'incorrectAltruistRevives' | 'correctSwaps' | 'incorrectSwaps'
  | 'correctVotes' | 'incorrectVotes', number | undefined>>;

export type ProtectTypes = Record<'medic' | 'mirrorcaster' | 'oracle' | 'warden', Pair>;
export interface GuessTypes { roles: Pair; modifiers: Pair }

export interface GroupedCounters {
  kills: Pair & { types: Record<'standard' | 'jailorExecutes' | 'deputyShoots', Pair> };
  guesses: Pair & { types: GuessTypes | null };
  protects: Pair & { types: ProtectTypes };
  other: Pair & {
    types: { prosecutes: Pair; altruistRevives: Pair; swaps: Pair; janitorCleans: number; knights: Pair };
  };
  votes: Pair | null;
}

export interface GroupOptions {
  season: number;
  /** Rola gracza w grze. Ochrony Monarcha to `knights`, nie `protects`. */
  role?: string;
  /** Ochrony według roli z akcji `protect`. Bez nich: kolumny (sezony 2-3) albo rola (sezon 4+). */
  protectTypes?: ProtectTypes | null;
  /** Zgadnięcia z akcji. `null`, gdy gra nie ma danych akcji. */
  guessTypes?: GuessTypes | null;
  /** `null`, gdy gra nie ma danych akcji. */
  votes?: Pair | null;
}

const n = (value: number | undefined) => value || 0;
const pair = (correct: number | undefined, incorrect: number | undefined): Pair => ({ correct: n(correct), incorrect: n(incorrect) });
export const emptyPair = (): Pair => ({ correct: 0, incorrect: 0 });
export const emptyProtectTypes = (): ProtectTypes => ({ medic: emptyPair(), mirrorcaster: emptyPair(), oracle: emptyPair(), warden: emptyPair() });
const sum = (...pairs: Pair[]): Pair => ({
  correct: pairs.reduce((total, p) => total + p.correct, 0),
  incorrect: pairs.reduce((total, p) => total + p.incorrect, 0),
});

const PROTECT_ROLES: Record<string, keyof ProtectTypes> = {
  medic: 'medic', mirrorcaster: 'mirrorcaster', oracle: 'oracle', warden: 'warden',
};
export const protectSubtypeForRole = (role: string, season: number): keyof ProtectTypes | null =>
  PROTECT_ROLES[normalizeRoleName(role, season).toLowerCase().replace(/[^a-z]/g, '')] ?? null;

export function buildGroupedCounters(c: CounterColumns, opts: GroupOptions): GroupedCounters {
  const mira = opts.season >= FIRST_MIRA_SEASON;
  const monarch = mira && !!opts.role && normalizeRoleName(opts.role, opts.season) === 'Monarch';

  const standard = pair(c.correctKills, c.incorrectKills);
  const jailorExecutes = pair(c.correctJailorExecutes, c.incorrectJailorExecutes);
  const deputyShoots = pair(c.correctDeputyShoots, c.incorrectDeputyShoots);

  const columnProtects = pair(c.correctProtects, c.incorrectProtects);
  const fortifies = pair(c.correctWardenFortifies, c.incorrectWardenFortifies);
  // Jak w `categorize()`: ochrony i wzmocnienia Monarcha to jego pasowania.
  const knights = monarch ? sum(columnProtects, fortifies) : emptyPair();
  const ownProtects = monarch ? emptyPair() : columnProtects;

  let protectTypes: ProtectTypes;
  if (opts.protectTypes) {
    protectTypes = opts.protectTypes;
  } else if (!mira) {
    protectTypes = { ...emptyProtectTypes(), medic: ownProtects, warden: monarch ? emptyPair() : fortifies };
  } else {
    protectTypes = emptyProtectTypes();
    const subtype = opts.role ? protectSubtypeForRole(opts.role, opts.season) : null;
    if (subtype) protectTypes[subtype] = sum(ownProtects, fortifies);
  }

  const prosecutes = pair(c.correctProsecutes, c.incorrectProsecutes);
  const altruistRevives = pair(c.correctAltruistRevives, c.incorrectAltruistRevives);
  const swaps = pair(c.correctSwaps, c.incorrectSwaps);
  const janitorCleans = n(c.janitorCleans);
  // Czyszczenie ciała nie ma werdyktu i liczy się jako correct, jak w `categorize()`.
  const other = sum(prosecutes, altruistRevives, swaps, knights, { correct: janitorCleans, incorrect: 0 });

  return {
    kills: { ...sum(standard, jailorExecutes, deputyShoots), types: { standard, jailorExecutes, deputyShoots } },
    guesses: { ...pair(c.correctGuesses, c.incorrectGuesses), types: opts.guessTypes ?? null },
    protects: { ...(monarch ? emptyPair() : sum(ownProtects, fortifies)), types: protectTypes },
    other: { ...other, types: { prosecutes, altruistRevives, swaps, janitorCleans, knights } },
    votes: opts.votes === undefined ? null : opts.votes,
  };
}

const addPair = (a: Pair, b: Pair): Pair => ({ correct: a.correct + b.correct, incorrect: a.incorrect + b.incorrect });
const sumNullable = <T>(items: Array<T | null>, add: (a: T, b: T) => T): T | null =>
  items.some((item) => item === null) || items.length === 0 ? null : items.reduce((a, b) => add(a as T, b as T)) as T;

/**
 * Suma liczników z kilku grup (np. ról gracza). Każda grupa jest policzona z własną rolą,
 * więc ochrony Monarcha zostają w `knights`, a `types` sumują się do sumy grupy.
 * `null` zostaje `null`, gdy którakolwiek składowa go ma.
 */
export function sumGroupedCounters(list: GroupedCounters[]): GroupedCounters {
  const sumPairs = (pick: (c: GroupedCounters) => Pair) => list.map(pick).reduce(addPair, emptyPair());
  const sumTypes = <K extends string>(keys: readonly K[], pick: (c: GroupedCounters) => Record<K, Pair>) =>
    Object.fromEntries(keys.map((key) => [key, list.map((c) => pick(c)[key]).reduce(addPair, emptyPair())])) as Record<K, Pair>;
  return {
    kills: { ...sumPairs((c) => c.kills), types: sumTypes(['standard', 'jailorExecutes', 'deputyShoots'] as const, (c) => c.kills.types) },
    guesses: {
      ...sumPairs((c) => c.guesses),
      types: sumNullable(list.map((c) => c.guesses.types), (a, b) => ({ roles: addPair(a.roles, b.roles), modifiers: addPair(a.modifiers, b.modifiers) })),
    },
    protects: { ...sumPairs((c) => c.protects), types: sumTypes(['medic', 'mirrorcaster', 'oracle', 'warden'] as const, (c) => c.protects.types) },
    other: {
      ...sumPairs((c) => c.other),
      types: {
        prosecutes: sumPairs((c) => c.other.types.prosecutes),
        altruistRevives: sumPairs((c) => c.other.types.altruistRevives),
        swaps: sumPairs((c) => c.other.types.swaps),
        janitorCleans: list.reduce((total, c) => total + c.other.types.janitorCleans, 0),
        knights: sumPairs((c) => c.other.types.knights),
      },
    },
    votes: sumNullable(list.map((c) => c.votes), addPair),
  };
}
