import { buildGroupedCounters, sumGroupedCounters, type CounterColumns } from './counters';
import { categorize } from '@/app/dramaafera/_utils/statsBreakdown';

const columns: CounterColumns = {
  correctKills: 3, incorrectKills: 1, correctGuesses: 2, incorrectGuesses: 1,
  correctProsecutes: 1, incorrectProsecutes: 1, correctDeputyShoots: 2, incorrectDeputyShoots: 1,
  correctJailorExecutes: 4, incorrectJailorExecutes: 2, correctProtects: 5, incorrectProtects: 2,
  correctWardenFortifies: 3, incorrectWardenFortifies: 1, janitorCleans: 2,
  correctAltruistRevives: 1, incorrectAltruistRevives: 0, correctSwaps: 2, incorrectSwaps: 1,
  correctVotes: 7, incorrectVotes: 3,
};

describe('season 4 groups equal categorize()', () => {
  for (const role of [undefined, 'Medic', 'Warden', 'Monarch', 'Janitor']) {
    test(`role ${role ?? 'none'}`, () => {
      const site = categorize(columns, 4, role);
      const api = buildGroupedCounters(columns, { season: 4, role, votes: { correct: 7, incorrect: 3 } });
      expect({ correct: api.kills.correct, incorrect: api.kills.incorrect }).toEqual(site.kills);
      expect({ correct: api.guesses.correct, incorrect: api.guesses.incorrect }).toEqual(site.guesses);
      expect({ correct: api.protects.correct, incorrect: api.protects.incorrect }).toEqual(site.protects);
      expect({ correct: api.other.correct, incorrect: api.other.incorrect }).toEqual(site.other);
      expect(api.votes).toEqual(site.votes);
    });
  }
});

test('the Monarch knighting is in other.types.knights and not in protects', () => {
  const api = buildGroupedCounters(columns, { season: 4, role: 'Monarch' });
  expect(api.other.types.knights).toEqual({ correct: 8, incorrect: 3 });
  expect(api.protects.correct).toBe(0);
});

describe('seasons 2-3 use the season 4 format', () => {
  const api = buildGroupedCounters(columns, { season: 3, role: 'Medic' });
  test('wardenFortifies are in protects, as the warden subtype', () => {
    expect(api.protects.types.warden).toEqual({ correct: 3, incorrect: 1 });
    expect(api.protects.types.medic).toEqual({ correct: 5, incorrect: 2 });
    expect(api.protects.types.mirrorcaster).toEqual({ correct: 0, incorrect: 0 });
    expect(api.protects.types.oracle).toEqual({ correct: 0, incorrect: 0 });
    expect(api.protects.correct).toBe(8);
  });
  test('the site puts the fortifies in other, the API does not', () => {
    const site = categorize(columns, 3, 'Medic');
    expect(site.other.correct - api.other.correct).toBe(3);
    expect(site.protects.correct - api.protects.correct).toBe(-3);
  });
});

test('missing data gives null and a Monarch in season 2 is a plain role', () => {
  const api = buildGroupedCounters({}, { season: 4 });
  expect(api.votes).toBeNull();
  expect(api.guesses.types).toBeNull();
  expect(api.other.types.janitorCleans).toBe(0);
});

test('action subtypes replace the role fallback', () => {
  const types = { medic: { correct: 1, incorrect: 0 }, mirrorcaster: { correct: 2, incorrect: 1 }, oracle: { correct: 0, incorrect: 0 }, warden: { correct: 0, incorrect: 0 } };
  expect(buildGroupedCounters(columns, { season: 4, role: 'Medic', protectTypes: types }).protects.types).toEqual(types);
});

describe('player total is the sum of the groups of each role', () => {
  const medicGames: CounterColumns = { correctProtects: 5, incorrectProtects: 2, correctKills: 1 };
  const monarchGames: CounterColumns = { correctProtects: 4, incorrectProtects: 1, correctWardenFortifies: 2 };
  const medicTypes = { medic: { correct: 5, incorrect: 2 }, mirrorcaster: { correct: 0, incorrect: 0 }, oracle: { correct: 0, incorrect: 0 }, warden: { correct: 0, incorrect: 0 } };
  const none = { medic: { correct: 0, incorrect: 0 }, mirrorcaster: { correct: 0, incorrect: 0 }, oracle: { correct: 0, incorrect: 0 }, warden: { correct: 0, incorrect: 0 } };

  const medic = buildGroupedCounters(medicGames, { season: 4, role: 'Medic', protectTypes: medicTypes });
  const monarch = buildGroupedCounters(monarchGames, { season: 4, role: 'Monarch', protectTypes: none });
  const total = sumGroupedCounters([medic, monarch]);

  test('Monarch knightings stay in knights, not in protects', () => {
    expect(total.other.types.knights).toEqual({ correct: 6, incorrect: 1 });
    expect(total.protects.correct).toBe(5);
    expect(total.protects.incorrect).toBe(2);
  });

  test('the protects types sum to the group total', () => {
    const sumTypes = Object.values(total.protects.types).reduce((a, b) => ({ correct: a.correct + b.correct, incorrect: a.incorrect + b.incorrect }));
    expect(sumTypes).toEqual({ correct: total.protects.correct, incorrect: total.protects.incorrect });
  });

  test('the total equals categorize() summed over the same roles', () => {
    const site = [categorize(medicGames, 4, 'Medic'), categorize(monarchGames, 4, 'Monarch')];
    expect(total.protects.correct).toBe(site[0].protects.correct + site[1].protects.correct);
    expect(total.other.correct).toBe(site[0].other.correct + site[1].other.correct);
    expect(total.kills.correct).toBe(site[0].kills.correct + site[1].kills.correct);
  });

  test('a null part makes the sum null', () => {
    expect(sumGroupedCounters([medic, buildGroupedCounters({}, { season: 4 })]).votes).toBeNull();
  });
});
