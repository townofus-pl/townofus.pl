/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildOpenApiDocument } from './openapi';

const doc: any = buildOpenApiDocument();

/** Struktury, które mają trafić do `components.schemas`. Zmiana listy wymaga zmiany testu. */
const STRUCTURES = [
  'Error', 'CorrectIncorrect', 'Ability',
  'Counters', 'KillCounters', 'GuessCounters', 'ProtectCounters', 'OtherCounters', 'VoteCounters', 'PlayerActions',
  'Season', 'SeasonList', 'SessionSummary', 'SessionList', 'Session', 'SessionPlayer', 'SessionRole',
  'GameSummary', 'GameList', 'Game', 'GamePlayer', 'Meeting', 'GameEvents', 'GameEvent',
  'RankingPlayer', 'Ranking', 'Player', 'PlayerStats', 'RoleBreakdownEntry', 'BestGame', 'RatingHistoryEntry', 'VotingStats', 'VotingRelation',
  'RoleSummary', 'RoleList', 'Role', 'RoleDetails', 'RolePlayer', 'TopPerformance',
  'Settings',
];

const resolve = (ref: string) => ref.replace('#/', '').split('/').reduce((acc: any, key) => acc?.[key], doc);

function hasDescription(property: any): boolean {
  if (!property) return false;
  if (property.description) return true;
  if (property.$ref) return Boolean(resolve(property.$ref)?.description);
  if (Array.isArray(property.allOf)) return property.allOf.some(hasDescription);
  return false;
}

/** Zbiera pola obiektów ze schematu: ścieżka, czy ma opis. Idzie przez `items`, `allOf` i wartości rekordów. */
function collectFields(schema: any, path: string, out: Array<{ path: string; described: boolean }>, seen = new Set<string>()) {
  if (!schema || typeof schema !== 'object') return;
  if (schema.$ref) {
    if (seen.has(schema.$ref)) return;
    seen.add(schema.$ref);
    return; // struktury z components są sprawdzane osobno
  }
  for (const part of schema.allOf ?? []) collectFields(part, path, out, seen);
  if (schema.items) collectFields(schema.items, `${path}[]`, out, seen);
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') collectFields(schema.additionalProperties, `${path}{}`, out, seen);
  for (const [name, property] of Object.entries<any>(schema.properties ?? {})) {
    out.push({ path: `${path}.${name}`, described: hasDescription(property) });
    collectFields(property, `${path}.${name}`, out, seen);
  }
}

function allResponseFields() {
  const fields: Array<{ path: string; described: boolean }> = [];
  for (const [name, schema] of Object.entries<any>(doc.components.schemas)) collectFields(schema, name, fields);
  for (const [route, item] of Object.entries<any>(doc.paths)) {
    for (const [status, response] of Object.entries<any>(item.get.responses)) {
      for (const [type, media] of Object.entries<any>(response.content ?? {})) {
        if (type === 'application/json') collectFields(media.schema, `${route} ${status}`, fields);
      }
    }
  }
  return fields;
}

test('every response field has a description in Polish text', () => {
  const fields = allResponseFields();
  const missing = fields.filter((field) => !field.described).map((field) => field.path);
  expect(fields.length).toBeGreaterThan(150);
  expect(missing).toEqual([]);
});

test('every named structure has a description and the list of names is fixed', () => {
  expect(Object.keys(doc.components.schemas).sort()).toEqual([...STRUCTURES].sort());
  for (const [name, schema] of Object.entries<any>(doc.components.schemas)) {
    expect([name, Boolean(schema.description)]).toEqual([name, true]);
  }
});

test('the main structures have examples', () => {
  for (const name of ['Error', 'Season', 'SessionSummary', 'GameSummary', 'Counters', 'GameEvent', 'RankingPlayer', 'RoleSummary', 'SessionPlayer', 'RatingHistoryEntry']) {
    expect([name, doc.components.schemas[name].example !== undefined]).toEqual([name, true]);
  }
});

test('responses use $ref to the named structures, not inline copies', () => {
  const body = (route: string) => doc.paths[route].get.responses['200'].content['application/json'].schema;
  expect(body('/api/v2/games/{id}')).toEqual({ $ref: '#/components/schemas/Game' });
  expect(body('/api/v2/games/{id}/events')).toEqual({ $ref: '#/components/schemas/GameEvents' });
  expect(body('/api/v2/ranking')).toEqual({ $ref: '#/components/schemas/Ranking' });
  expect(body('/api/v2/players/{nick}')).toEqual({ $ref: '#/components/schemas/Player' });
  expect(body('/api/v2/settings')).toEqual({ $ref: '#/components/schemas/Settings' });
});

test('the Counters tree is defined once and referenced from the three places that use it', () => {
  // Bez przykładów: przykład Counters ma te same nazwy, ale nie jest definicją.
  const text = JSON.stringify(doc, (key, value) => (key === 'example' ? undefined : value));
  // Nazwy z drzewa liczników są tylko w jego definicji.
  for (const key of ['jailorExecutes', 'altruistRevives', 'janitorCleans', 'mirrorcaster']) {
    expect([key, text.split(`"${key}":{`).length - 1]).toEqual([key, 1]);
  }
  const refs = text.split('"$ref":"#/components/schemas/Counters"').length - 1;
  expect(refs).toBe(3);
});

test('errors 400, 404 and 500 are components.responses and no route repeats them', () => {
  expect(Object.keys(doc.components.responses).sort()).toEqual(['BadRequest', 'NotFound', 'ServerError']);
  for (const item of Object.values<any>(doc.paths)) {
    for (const [status, response] of Object.entries<any>(item.get.responses)) {
      if (['400', '404', '500'].includes(status)) expect(String(response.$ref)).toMatch(/^#\/components\/responses\//);
    }
  }
  expect(JSON.stringify(doc.paths).split('Opis błędu po polsku').length - 1).toBe(0);
});

test('named structures keep their own description and are not overwritten at the place of use', () => {
  const schemas = doc.components.schemas;
  expect(schemas.Counters.description).toMatch(/^Liczniki gracza w grupach strony/);
  expect(schemas.CorrectIncorrect.description).toBe('Para liczników: trafne i nietrafne.');
  expect(schemas.PlayerStats.description).toMatch(/^Statystyki gracza w sezonie/);
  expect(schemas.VotingStats.description).toMatch(/^Statystyki głosowań/);
  expect(schemas.Ability.description).toMatch(/^Zdolność użyta w akcji/);
  expect(schemas.KillCounters.description).toMatch(/^Zabójstwa/);
});
