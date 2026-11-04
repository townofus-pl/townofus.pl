/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildOpenApiDocument } from './openapi';
import { findForbiddenFields } from '@/app/dramaafera/_services/games/_forbiddenFields';

const doc = buildOpenApiDocument();

const EXPECTED = [
  '/api/v2/seasons', '/api/v2/sessions', '/api/v2/sessions/{date}', '/api/v2/games', '/api/v2/games/{id}',
  '/api/v2/ranking', '/api/v2/players/{nick}', '/api/v2/roles', '/api/v2/roles/{name}',
  '/api/v2/settings', '/api/v2/downloads/aunlocker',
];

test('documents every planned public route and nothing else', () => {
  expect(Object.keys(doc.paths ?? {}).sort()).toEqual([...EXPECTED].sort());
});

test('every operation is a GET, so the POST of /api/v2/games is not documented', () => {
  for (const item of Object.values(doc.paths ?? {})) expect(Object.keys(item)).toEqual(['get']);
  expect(JSON.stringify(doc)).not.toContain('basicAuth');
});

test('data routes accept season', () => {
  const dataRoutes = EXPECTED.filter((p) => !['settings', 'downloads', 'seasons'].some((x) => p.includes(x)));
  for (const path of dataRoutes) {
    const params = (doc.paths?.[path]?.get?.parameters ?? []) as { name: string }[];
    expect(params.map((p) => p.name)).toContain('season');
  }
});

test('there is no route that filters events across games', () => {
  expect(doc.paths?.['/api/v2/actions']).toBeUndefined();
  expect(Object.keys(doc.paths ?? {})).toHaveLength(11);
});

test('the definition has no point field except the delayed DAP fields', () => {
  expect(findForbiddenFields(doc, ['dap', 'averageDap', 'dapGames'])).toEqual([]);
});

const schemas = (path: string) => JSON.stringify(doc.paths?.[path]);
const game = (doc.paths?.['/api/v2/games/{id}']?.get?.responses as any)['200'].content['application/json'].schema;
const counters = game.properties.players.items.properties.counters;

test('player counters use the site grouping with types', () => {
  expect(Object.keys(counters.properties)).toEqual(['kills', 'guesses', 'protects', 'other', 'votes']);
  expect(Object.keys(counters.properties.kills.properties.types.properties)).toEqual(['kills', 'jailorExecutes', 'deputyShoots']);
  expect(Object.keys(counters.properties.protects.properties.types.properties)).toEqual(['protects', 'wardenFortifies']);
  expect(Object.keys(counters.properties.other.properties.types.properties))
    .toEqual(['prosecutes', 'altruistRevives', 'swaps', 'janitorCleans', 'knights', 'wardenFortifies']);
  expect(counters.properties.kills.properties.types.properties.kills.required).toEqual(['correct', 'incorrect']);
  expect(counters.properties.protects.description).toMatch(/sezonu 4/);
  expect(counters.properties.other.description).toMatch(/knights/);
});

test('completedTasks and survivedRounds are on the player, not in counters', () => {
  const player = game.properties.players.items.properties;
  expect(player.completedTasks).toBeDefined();
  expect(player.survivedRounds).toBeDefined();
  expect(JSON.stringify(counters)).not.toMatch(/completedTasks|survivedRounds/);
});

test('game events have the optional kill detail fields and the hidden-filter text', () => {
  const event = game.properties.events.items;
  for (const field of ['causeOfDeath', 'isGuess', 'guessedRole', 'guessedModifier']) {
    expect(event.properties[field]).toBeDefined();
    expect(event.required ?? []).not.toContain(field);
    expect(event.properties[field].description).toMatch(/Starsze gry możliwe, że nie mają/);
  }
  expect(event.properties.causeOfDeath.description).toMatch(/Surowy klucz/);
  expect(game.properties.events.description).toMatch(/osobno dla każdej gry/);
  expect(game.properties.events.description).toMatch(/filtr ukrytych akcji/);
});

test('the game has maxTasks and the timeline has the fields that the page shows', () => {
  expect(game.properties.maxTasks).toBeDefined();
  const event = game.properties.events.items.properties;
  for (const field of ['ability', 'killAbility', 'survivors', 'actionLabel']) expect(event[field]).toBeDefined();
});

test('best games of a player can be paged with offset', () => {
  const params = (doc.paths?.['/api/v2/players/{nick}']?.get?.parameters ?? []) as { name: string }[];
  expect(params.map((p) => p.name)).toEqual(expect.arrayContaining(['limit', 'offset']));
});

test('top performances state the latest-day exclusion', () => {
  expect(schemas('/api/v2/roles/{name}')).toContain('bez gier z ostatniego dnia');
});

test('the Emperor text states no selection rule and the definition has no scoring text', () => {
  expect(schemas('/api/v2/ranking')).toContain('Cesarz pokazany na stronie rankingu');
  expect(JSON.stringify(doc)).not.toMatch(/punkt|scoring|zamkni/i);
});

function flatCounterNames(value: unknown, path = '$'): string[] {
  if (Array.isArray(value)) return value.flatMap((item, i) => flatCounterNames(item, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => [
      ...(/^(correct|incorrect)[A-Z]/.test(key) ? [`${path}.${key}`] : []),
      ...flatCounterNames(child, `${path}.${key}`),
    ]);
  }
  return [];
}

test('the whole definition has no flat counter names', () => {
  expect(flatCounterNames(doc)).toEqual([]);
});

test('the player route reuses the grouped counters of the game route', () => {
  const player = (doc.paths?.['/api/v2/players/{nick}']?.get?.responses as any)['200'].content['application/json'].schema;
  expect(player.properties.stats.properties.counters).toEqual(counters);
});
