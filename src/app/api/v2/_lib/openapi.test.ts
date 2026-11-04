/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildOpenApiDocument } from './openapi';
import { ACTION_COUNT_KEYS, EVENT_TYPES } from './subtypes';
import { V2_ACTION_TYPES } from '@/app/api/schema/gamesV2';
import { TIMELINE_HIDDEN_TYPES, filterVisibleActions } from '@/app/dramaafera/_services/games/_buildGameTimeline';
import { findForbiddenFields } from '@/app/dramaafera/_services/games/_forbiddenFields';

const doc = buildOpenApiDocument();

const EXPECTED = [
  '/api/v2/seasons', '/api/v2/sessions', '/api/v2/sessions/{date}', '/api/v2/games', '/api/v2/games/{id}', '/api/v2/games/{id}/events',
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
  expect(Object.keys(doc.paths ?? {})).toHaveLength(12);
});

test('the definition has no point field except the delayed DAP fields', () => {
  expect(findForbiddenFields(doc, ['dap', 'averageDap', 'dapGames'])).toEqual([]);
});

const schemas = (path: string) => JSON.stringify(doc.paths?.[path]);
const game = (doc.paths?.['/api/v2/games/{id}']?.get?.responses as any)['200'].content['application/json'].schema;
const eventsDoc = (doc.paths?.['/api/v2/games/{id}/events']?.get?.responses as any)['200'].content['application/json'].schema;
const counters = game.properties.players.items.properties.counters;

test('player counters use the site grouping with types', () => {
  expect(Object.keys(counters.properties)).toEqual(['kills', 'guesses', 'protects', 'other', 'votes']);
  expect(Object.keys(counters.properties.kills.properties.types.properties)).toEqual(['standard', 'jailorExecutes', 'deputyShoots']);
  expect(Object.keys(counters.properties.protects.properties.types.properties)).toEqual(['medic', 'mirrorcaster', 'oracle', 'warden']);
  expect(Object.keys(counters.properties.guesses.properties.types.properties)).toEqual(['roles', 'modifiers']);
  expect(Object.keys(counters.properties.other.properties.types.properties))
    .toEqual(['prosecutes', 'altruistRevives', 'swaps', 'janitorCleans', 'knights']);
  expect(counters.properties.kills.properties.types.properties.standard.required).toEqual(['correct', 'incorrect']);
  expect(counters.properties.other.properties.types.properties.janitorCleans.type).toBe('number');
});

test('wardenFortifies is not in the definition and the protects text names the season sources', () => {
  expect(JSON.stringify(doc)).not.toContain('wardenFortifies');
  const text = counters.properties.protects.properties.types.description as string;
  expect(text).toMatch(/Sezony 1-3: stare kolumny liczników/);
  expect(text).toMatch(/Sezon 4 i późniejsze: akcje protect z game_actions/);
});

test('votes, guesses types and actions are nullable and say when they are null', () => {
  expect(counters.properties.votes.nullable).toBe(true);
  expect(counters.properties.guesses.properties.types.nullable).toBe(true);
  const player = game.properties.players.items.properties;
  expect(player.actions.nullable).toBe(true);
  expect(player.actions.description).toMatch(/null, gdy gra nie ma danych akcji/);
  expect(counters.properties.votes.description).toMatch(/null, gdy gra nie ma danych akcji/);
});

test('actions keys are the closed list of action types without a counter', () => {
  const keys = Object.keys(game.properties.players.items.properties.actions.properties ?? {});
  expect(keys.sort()).toEqual([...ACTION_COUNT_KEYS].sort());
  for (const key of ACTION_COUNT_KEYS) expect((V2_ACTION_TYPES as readonly string[]).includes(key)).toBe(true);
  expect(game.properties.players.items.properties.actions.description).toContain('lista zamknięta');
});

test('completedTasks and survivedRounds are on the player, not in counters', () => {
  const player = game.properties.players.items.properties;
  expect(player.completedTasks).toBeDefined();
  expect(player.survivedRounds).toBeDefined();
  expect(JSON.stringify(counters)).not.toMatch(/completedTasks|survivedRounds/);
});

test('event types are the mod action types minus the ones that the timeline hides', () => {
  const expected = V2_ACTION_TYPES.filter((t) => !TIMELINE_HIDDEN_TYPES.includes(t as never));
  expect([...EVENT_TYPES]).toEqual(expected);
  expect(eventsDoc.properties.events.items.properties.type.enum).toEqual(expected);
  // The hidden list matches the real filter of the game page.
  const hidden = V2_ACTION_TYPES.filter((type) => filterVisibleActions([{ type, detail: null, performer: { name: 'A' } }]).length === 0);
  expect(hidden.sort()).toEqual([...TIMELINE_HIDDEN_TYPES, 'role_assigned'].sort());
});

test('the event type list, the cause keys and the open-list notes are in the docs', () => {
  const event = eventsDoc.properties.events.items.properties;
  expect(event.type.description).toContain('lista zamknięta');
  expect(event.causeOfDeath.description).toContain('Lista jest otwarta');
  for (const key of ['Guess', 'Misguess', 'Doomsayer', 'Parasite', 'PuppetControl', 'Heartbreak', 'Medusa']) {
    expect(event.causeOfDeath.description).toContain(`${key} (`);
  }
  expect(event.actionType).toBeUndefined();
  expect(event.description).toBeUndefined();
  expect(event.killAbility).toBeUndefined();
  expect(event.ability).toBeDefined();
});

test('duplicates are gone', () => {
  const ranking = (doc.paths?.['/api/v2/ranking']?.get?.responses as any)['200'].content['application/json'].schema;
  expect(ranking.properties.players.items.properties.isEmperor).toBeUndefined();
  expect(ranking.properties.emperor).toBeDefined();
  const role = (doc.paths?.['/api/v2/roles/{name}']?.get?.responses as any)['200'].content['application/json'].schema;
  expect(role.properties.overview).toBeUndefined();
  expect(role.properties.role.properties.totalAppearances).toBeDefined();
  expect(eventsDoc.properties.hasTimeline).toBeUndefined();
});

test('naming is consistent', () => {
  const rank = (doc.paths?.['/api/v2/ranking']?.get?.responses as any)['200'].content['application/json'].schema.properties.players.items.properties;
  expect(rank.gamesPlayed).toBeDefined();
  expect(rank.totalGames).toBeUndefined();
  const player = (doc.paths?.['/api/v2/players/{nick}']?.get?.responses as any)['200'].content['application/json'].schema.properties;
  expect(player.roleBreakdown.additionalProperties.properties.gamesPlayed).toBeDefined();
  expect(player.roleBreakdown.additionalProperties.properties.games).toBeUndefined();
  const names = new Set<string>();
  (function walk(value: unknown) {
    if (Array.isArray(value)) return value.forEach(walk);
    if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) { names.add(key); walk(child); }
    }
  })(doc);
  for (const old of ['loses', 'winRatio', 'totalTasks', 'nickname', 'playerName', 'gamesWithRole', 'winsWithRole', 'winRateWithRole', 'categories', 'isEmperor']) {
    expect(names.has(old)).toBe(false);
  }
});

test('GET /api/v2/games/{id} has no events and links to the events route', () => {
  expect(game.properties.events).toBeUndefined();
  expect(game.properties.hasTimeline).toBeDefined();
  expect(doc.paths?.['/api/v2/games/{id}']?.get?.description).toContain('/api/v2/games/{id}/events');
});

test('the events route has the game id, hasTimeline, 404 and the season rule', () => {
  const get = doc.paths?.['/api/v2/games/{id}/events']?.get as any;
  expect(Object.keys(eventsDoc.properties)).toEqual(['id', 'events']);
  expect(Object.keys(get.responses)).toContain('404');
  expect(get.parameters.map((p: { name: string }) => p.name)).toEqual(expect.arrayContaining(['id', 'season']));
});

test('game events have the optional kill detail fields and the hidden-filter text', () => {
  const event = eventsDoc.properties.events.items;
  for (const field of ['causeOfDeath', 'isGuess', 'guessedRole', 'guessedModifier']) {
    expect(event.properties[field]).toBeDefined();
    expect(event.required ?? []).not.toContain(field);
    expect(event.properties[field].description).toMatch(/Starsze gry możliwe, że nie mają/);
  }
  expect(event.properties.causeOfDeath.description).toMatch(/Surowy klucz/);
  expect(eventsDoc.properties.events.description).toMatch(/osobno dla każdej gry/);
  expect(eventsDoc.properties.events.description).toMatch(/filtr ukrytych akcji/);
});

test('the game has maxTasks and the timeline has the fields that the page shows', () => {
  expect(game.properties.maxTasks).toBeDefined();
  const event = eventsDoc.properties.events.items.properties;
  for (const field of ['ability', 'survivors', 'actionLabel']) expect(event[field]).toBeDefined();
});

test('best games of a player can be paged with offset', () => {
  const params = (doc.paths?.['/api/v2/players/{nick}']?.get?.parameters ?? []) as { name: string }[];
  expect(params.map((p) => p.name)).toEqual(expect.arrayContaining(['limit', 'offset']));
});

test('best games lists carry no latest-day text', () => {
  const role = (doc.paths?.['/api/v2/roles/{name}']?.get?.responses as any)['200'].content['application/json'].schema.properties;
  const player = (doc.paths?.['/api/v2/players/{nick}']?.get?.responses as any)['200'].content['application/json'].schema.properties;
  expect(role.topPerformances.description).not.toContain('ostatniego dnia');
  expect(player.bestGames.description).not.toContain('ostatniego dnia');
  expect(doc.paths?.['/api/v2/players/{nick}']?.get?.description).not.toContain('ostatni');
});

test('the Emperor text states no selection rule and the definition has no scoring text', () => {
  expect(schemas('/api/v2/ranking')).toContain('Cesarz pokazany na stronie rankingu');
  expect(JSON.stringify(doc)).not.toMatch(/punkt|scoring|zamkniętej sesji/i);
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
