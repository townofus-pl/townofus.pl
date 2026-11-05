import { ApiError, intParam, normalizeDate, optionalSeasonParam, seasonParam } from './http';

const req = (query: string) => new Request(`http://localhost/api/v2/x${query}`);
const status = (fn: () => unknown) => { try { fn(); return 200; } catch (e) { return e instanceof ApiError ? e.status : 500; } };

test('season defaults to the current season and rejects season 1 with 404', () => {
  expect(seasonParam(req(''))).toBe(4);
  expect(seasonParam(req('?season=3'))).toBe(3);
  expect(status(() => seasonParam(req('?season=1')))).toBe(404);
  expect(status(() => seasonParam(req('?season=99')))).toBe(404);
  expect(status(() => seasonParam(req('?season=abc')))).toBe(400);
});

test('the optional season is undefined without the parameter', () => {
  expect(optionalSeasonParam(req(''))).toBeUndefined();
  expect(optionalSeasonParam(req('?season=2'))).toBe(2);
  expect(status(() => optionalSeasonParam(req('?season=1')))).toBe(404);
});

test('limits and dates are validated', () => {
  expect(intParam(req('?limit=5'), 'limit', 10, { min: 1, max: 50 })).toBe(5);
  expect(status(() => intParam(req('?limit=0'), 'limit', 10, { min: 1, max: 50 }))).toBe(400);
  expect(normalizeDate('2026-10-21')).toBe('20261021');
  expect(status(() => normalizeDate('21-10-2026'))).toBe(400);
});
