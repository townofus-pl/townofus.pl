// Server-side role lookup against the **full** registries.
//
// ⚠️ Do not import this from a client component. `gameUtils` exists for that: it reads a slim
// generated index (24 KB) so the browser does not receive ~266 KB of JSX descriptions, settings
// and ability definitions. This module is for pages that genuinely need the whole role object —
// today only the role detail page, which renders the description, abilities and settings.

import type { Role } from '@/constants/rolesAndModifiers';
import { Roles } from '@/roles';
import { MiraRoles } from '@/mira';
import { FIRST_MIRA_SEASON } from './gameUtils';

/**
 * Finds the full role definition for the era a season was played in.
 *
 * The `' / '` split is applied for legacy seasons only, and that restriction is the point.
 * Legacy bundles two roles into one entry (`Politician / Mayor`, `Plaguebearer / Pestilence`),
 * so splitting is the correct way to resolve `Mayor` there. TOU-Mira splits them into genuinely
 * separate roles — applying the same fallback made a Mira `Mayor` resolve onto the legacy
 * `Politician / Mayor` entry and render **Politician's** description, abilities and settings
 * under the heading "Mayor". Confidently wrong rather than blank, which is worse. See #308.
 */
export function findFullRole(roleName: string, season: number): Role | undefined {
  const registry: readonly Role[] = season >= FIRST_MIRA_SEASON ? MiraRoles : Roles;

  const exact = registry.find((r) => r.name === roleName);
  if (exact) return exact;

  if (season < FIRST_MIRA_SEASON) {
    const bundled = registry.find(
      (r) => r.name.includes(' / ') && r.name.split(' / ').some((part) => part === roleName),
    );
    if (bundled) return bundled;
  }

  const normalized = roleName.toLowerCase().replace(/\s+/g, '');
  return registry.find((r) => r.name.toLowerCase().replace(/\s+/g, '') === normalized);
}
