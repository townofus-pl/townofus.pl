import { getDramaAferaSettings } from '@/app/dramaafera/_services/settings';
import { SettingsResponseSchema } from '../_lib/schemas';
import { publicGet, preflight } from '../_lib/http';

export const OPTIONS = preflight;

// Pliki ustawień, które pokazują strona ustawień i changelog.
export const GET = publicGet(SettingsResponseSchema, async () => getDramaAferaSettings());
