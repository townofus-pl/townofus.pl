import { generateRoleRankingSummary } from '@/app/dramaafera/_services';
import { RolesResponseSchema } from '../_lib/schemas';
import { publicGet, preflight, seasonParam } from '../_lib/http';
import { toPublicRole } from './_role';

export const OPTIONS = preflight;

// Tabela ról jak na stronie `role`. `dap` i `averageDap` pomijają ostatni dzień z grami w sezonie.
export const GET = publicGet(RolesResponseSchema, async (request) => {
  const season = seasonParam(request);
  const roles = await generateRoleRankingSummary(season, undefined, undefined, { excludeLatestDay: true });
  return { season, roles: roles.map(toPublicRole) };
});
