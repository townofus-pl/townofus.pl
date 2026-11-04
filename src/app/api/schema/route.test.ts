import { GET } from './route';

test('gives the public definition without credentials, with exactly the 12 public routes', async () => {
  const response = GET();
  expect(response.status).toBe(200);
  const doc = (await response.json()) as { paths: Record<string, unknown> };
  expect(Object.keys(doc.paths)).toHaveLength(12);
  for (const path of Object.keys(doc.paths)) expect(path.startsWith('/api/v2/')).toBe(true);
  expect(JSON.stringify(doc)).not.toMatch(/basicAuth|\/api\/season\/reset|\/api\/games\b|\/api\/players/);
});
