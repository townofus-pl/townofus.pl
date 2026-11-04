import { buildOpenApiDocument } from './openapi';
import { findForbiddenFields } from '@/app/dramaafera/_services/games/_forbiddenFields';

const doc = buildOpenApiDocument();

const EXPECTED = [
  '/api/v2/seasons', '/api/v2/sessions', '/api/v2/sessions/{date}', '/api/v2/games', '/api/v2/games/{id}',
  '/api/v2/actions', '/api/v2/ranking', '/api/v2/players/{nick}', '/api/v2/roles', '/api/v2/roles/{name}',
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

test('actions accepts the required filters', () => {
  const params = (doc.paths?.['/api/v2/actions']?.get?.parameters ?? []) as { name: string }[];
  expect(params.map((p) => p.name)).toEqual(expect.arrayContaining(['type', 'date', 'season', 'player', 'role', 'cause', 'isGuess']));
  const schemas = JSON.stringify(doc.paths?.['/api/v2/actions']);
  for (const field of ['causeOfDeath', 'isGuess', 'guessedRole', 'guessedModifier']) expect(schemas).toContain(field);
});

test('the definition has no point field except the delayed DAP fields', () => {
  expect(findForbiddenFields(doc, ['dap', 'averageDap', 'dapGames'])).toEqual([]);
});
