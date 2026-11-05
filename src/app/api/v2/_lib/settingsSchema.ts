import { z } from 'zod';

// Odpowiedź `GET /api/v2/settings`. Plik zawiera tylko zod, bez OpenAPI,
// bo importuje go też komponent kliencki (SettingsDramaAfera).
// Fabryka: schemat powstaje po `extendZodWithOpenApi` w `schemas.ts`, więc ma metodę `.openapi`.
export const createSettingsSchema = () => z.object({
  current: z.string().describe('Zawartość bieżącego pliku ustawień (.cfg), który wgrał host'),
  old: z.string().nullable().describe('Zawartość poprzedniego pliku ustawień albo null, gdy go nie ma'),
});

export const SettingsBaseSchema = createSettingsSchema();

export type SettingsResponse = z.infer<typeof SettingsBaseSchema>;
