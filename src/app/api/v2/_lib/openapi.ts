import { z } from 'zod';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import {
  SeasonsResponseSchema,
  SessionsResponseSchema,
  SessionResponseSchema,
  GamesResponseSchema,
  GameResponseSchema,
  RankingResponseSchema,
  PlayerResponseSchema,
  RolesResponseSchema,
  RoleResponseSchema,
  SettingsResponseSchema,
  GameEventsResponseSchema,
  ErrorResponseSchema,
} from './schemas';

extendZodWithOpenApi(z);

// Osobny rejestr tylko dla publicznych tras. Globalny rejestr zawiera też trasy z logowaniem.
const registry = new OpenAPIRegistry();

const season = z.coerce.number().int().optional().openapi({
  param: { name: 'season', in: 'query' },
  description: 'Numer sezonu, od 2. Bez tego parametru: bieżący sezon. Sezon 1 nie jest w bazie danych, więc season=1 daje 404.',
  example: 4,
});
const limit = (def: number, max: number) =>
  z.coerce.number().int().min(1).max(max).optional().openapi({ param: { name: 'limit', in: 'query' }, description: `Liczba wyników (domyślnie ${def}, maksymalnie ${max}).` });
const offset = z.coerce.number().int().min(0).optional().openapi({ param: { name: 'offset', in: 'query' }, description: 'Przesunięcie od początku listy.' });

const errors = {
  400: { description: 'Nieprawidłowy parametr', content: { 'application/json': { schema: ErrorResponseSchema } } },
  500: { description: 'Błąd serwera', content: { 'application/json': { schema: ErrorResponseSchema } } },
};
const notFound = { 404: { description: 'Nie znaleziono', content: { 'application/json': { schema: ErrorResponseSchema } } } };
const ok = (schema: z.ZodType, description: string) => ({ 200: { description, content: { 'application/json': { schema } } } });

const dateParam = z.string().openapi({ param: { name: 'date', in: 'path' }, description: 'Data sesji: YYYYMMDD lub YYYY-MM-DD.', example: '20261021' });

registry.registerPath({
  method: 'get', path: '/api/v2/seasons', tags: ['Sezony'], summary: 'Lista sezonów',
  description: 'Te same sezony, które pokazuje przełącznik sezonu na stronie: sezon 2 i późniejsze. Sezonu 1 nie ma na liście, bo jego dane nie są w bazie danych.',
  responses: { ...ok(SeasonsResponseSchema, 'Sezony'), ...errors },
});

registry.registerPath({
  method: 'get', path: '/api/v2/sessions', tags: ['Sesje'], summary: 'Lista sesji sezonu',
  description: 'Źródło: strona historia-gier. Zawiera też otwartą (ostatnią) sesję oraz daty, które mają tylko listę graczy sesji.',
  request: { query: z.object({ season }) },
  responses: { ...ok(SessionsResponseSchema, 'Sesje od najnowszej'), ...notFound, ...errors },
});

registry.registerPath({
  method: 'get', path: '/api/v2/sessions/{date}', tags: ['Sesje'], summary: 'Wyniki sesji',
  description: 'Źródło: strona wyniki. Zawiera gry sesji, wyniki graczy i ról oraz listę graczy sesji, jeśli ją opublikowano.',
  request: { params: z.object({ date: dateParam }), query: z.object({ season }) },
  responses: { ...ok(SessionResponseSchema, 'Wyniki sesji'), ...notFound, ...errors },
});

registry.registerPath({
  method: 'get', path: '/api/v2/games', tags: ['Gry'], summary: 'Lista gier sezonu',
  description: 'Źródło: strona gry. Ta trasa nie wymaga logowania. Logowania wymaga tylko POST, którego tu nie opisano.',
  request: {
    query: z.object({
      season, limit: limit(100, 500), offset,
      date: z.string().optional().openapi({ param: { name: 'date', in: 'query' }, description: 'Tylko gry z tej daty (YYYYMMDD).' }),
    }),
  },
  responses: { ...ok(GamesResponseSchema, 'Gry od najnowszej'), ...notFound, ...errors },
});

registry.registerPath({
  method: 'get', path: '/api/v2/games/{id}', tags: ['Gry'], summary: 'Szczegóły gry',
  description: 'Źródło: strona gry. Zawiera liczniki graczy i spotkania. Zdarzenia osi czasu są pod GET /api/v2/games/{id}/events. Z parametrem season trasa sprawdza, czy gra należy do tego sezonu.',
  request: {
    params: z.object({ id: z.string().openapi({ param: { name: 'id', in: 'path' }, description: 'Identyfikator gry.', example: '20261021_1106' }) }),
    query: z.object({ season }),
  },
  responses: { ...ok(GameResponseSchema, 'Gra'), ...notFound, ...errors },
});

registry.registerPath({
  method: 'get', path: '/api/v2/games/{id}/events', tags: ['Gry'], summary: 'Zdarzenia gry',
  description: 'Źródło: oś czasu na stronie gry. Zdarzenia są czytane osobno dla każdej gry i mają ten sam filtr ukrytych akcji co strona gry. Zabójstwa i śmierci mogą mieć pola causeOfDeath, isGuess, guessedRole i guessedModifier. Z parametrem season trasa sprawdza, czy gra należy do tego sezonu.',
  request: {
    params: z.object({ id: z.string().openapi({ param: { name: 'id', in: 'path' }, description: 'Identyfikator gry.', example: '20261021_1106' }) }),
    query: z.object({ season }),
  },
  responses: { ...ok(GameEventsResponseSchema, 'Zdarzenia gry'), ...notFound, ...errors },
});

registry.registerPath({
  method: 'get', path: '/api/v2/ranking', tags: ['Ranking'], summary: 'Ranking sezonu',
  description: 'Źródło: strona ranking. Pole dap pomija ostatni dzień z grami w sezonie. Cesarz jest taki, jak na stronie rankingu.',
  request: { query: z.object({ season, limit: limit(50, 200), offset }) },
  responses: { ...ok(RankingResponseSchema, 'Ranking'), ...notFound, ...errors },
});

registry.registerPath({
  method: 'get', path: '/api/v2/players/{nick}', tags: ['Gracze'], summary: 'Profil gracza',
  description: 'Źródło: strona gracza. Zawiera historię ratingu, gwiazdki, statystyki i głosowania. Najlepsze gry są w kolejności ze strony gracza. Parametry limit i offset dzielą listę najlepszych gier na strony, a hasMoreBestGames mówi, czy jest następna strona.',
  request: {
    params: z.object({ nick: z.string().openapi({ param: { name: 'nick', in: 'path' }, description: 'Nick albo slug nicka.', example: 'Malkiz' }) }),
    query: z.object({ season, limit: limit(10, 50), offset }),
  },
  responses: { ...ok(PlayerResponseSchema, 'Profil'), ...notFound, ...errors },
});

registry.registerPath({
  method: 'get', path: '/api/v2/roles', tags: ['Role'], summary: 'Tabela ról',
  description: 'Źródło: strona role. Pola dap i averageDap pomijają ostatni dzień z grami w sezonie.',
  request: { query: z.object({ season }) },
  responses: { ...ok(RolesResponseSchema, 'Role'), ...notFound, ...errors },
});

registry.registerPath({
  method: 'get', path: '/api/v2/roles/{name}', tags: ['Role'], summary: 'Szczegóły roli',
  description: 'Źródło: strona roli. Najlepsze występy są w kolejności ze strony roli.',
  request: {
    params: z.object({ name: z.string().openapi({ param: { name: 'name', in: 'path' }, description: 'Nazwa roli albo slug.', example: 'sheriff' }) }),
    query: z.object({ season, limit: limit(50, 500) }),
  },
  responses: { ...ok(RoleResponseSchema, 'Rola'), ...notFound, ...errors },
});

registry.registerPath({
  method: 'get', path: '/api/v2/settings', tags: ['Ustawienia'], summary: 'Pliki ustawień',
  description: 'Źródło: SettingsDramaAfera. Bieżący i poprzedni plik ustawień.',
  responses: { ...ok(SettingsResponseSchema, 'Ustawienia'), ...errors },
});

registry.registerPath({
  method: 'get', path: '/api/v2/downloads/aunlocker', tags: ['Pobieranie'], summary: 'Najnowsza biblioteka AUnlocker',
  description: 'Źródło: strona do_pobrania. Zwraca plik AUnlocker.dll. Gdy GitHub nie ma wydania z plikiem, trasa przekierowuje na stronę wydań. Trasa jest przeznaczona do pobrania przez link. Trasa nie ma nagłówków CORS, więc przeglądarka na innej stronie nie pobierze pliku przez fetch.',
  responses: {
    200: { description: 'Plik DLL', content: { 'application/octet-stream': { schema: z.string().openapi({ format: 'binary' }) } } },
    302: { description: 'Przekierowanie na stronę wydań' },
  },
});

export function buildOpenApiDocument() {
  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'TownOfUs.pl – publiczne API',
      version: '2.0.0',
      description: 'Publiczne dane Drama Afera. Wszystkie trasy to GET bez logowania. Dane odpowiadają temu, co widzi osoba bez konta na stronie.',
    },
    servers: [{ url: '/' }],
  });
}
