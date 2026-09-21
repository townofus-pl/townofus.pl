// Pure utility functions for the Dramaafera game data layer.
// No Prisma/Cloudflare dependencies — safe to import from any module.

import { Modifiers } from '@/modifiers';
import { Teams } from '@/constants/teams';
import {
  LEGACY_ROLE_INDEX,
  MIRA_ROLE_INDEX,
  type SlimRole,
} from '@/roles/_generated/roleIndex';

// ---------------------------------------------------------------------------
// Season-aware role registry
// ---------------------------------------------------------------------------

/** Season 4 onward is played on TOU-Mira. Earlier seasons used the legacy role set. */
export const FIRST_MIRA_SEASON = 4;

/**
 * Which role registry a season's data must be read against.
 *
 * The two registries overlap on ~55 names but disagree in ways that matter: legacy bundles
 * `Politician / Mayor` and `Plaguebearer / Pestilence` into single entries where Mira splits
 * them, 5 roles are legacy-only and 22 are Mira-only. Resolving a season-3 game against Mira —
 * or a season-4 game against legacy — produces confidently wrong names, colours and teams rather
 * than blanks, which is why every resolver below takes an explicit season instead of defaulting
 * to the current one. See #311.
 */
function registryForSeason(season: number): readonly SlimRole[] {
  return season >= FIRST_MIRA_SEASON ? MIRA_ROLE_INDEX : LEGACY_ROLE_INDEX;
}

/** Single lookup shared by every resolver, so they can never disagree about a role. */
function findRole(roleName: string, season: number): SlimRole | undefined {
  const displayName = convertRoleNameForDisplay(roleName);
  const lowerRole = roleName.toLowerCase();
  const lowerDisplay = displayName.toLowerCase();

  return registryForSeason(season).find(
    (r) =>
      r.id.toLowerCase() === lowerRole ||
      r.name.toLowerCase() === lowerDisplay ||
      r.name.toLowerCase() === lowerRole,
  );
}

// ---------------------------------------------------------------------------
// Duration & date formatting
// ---------------------------------------------------------------------------

export function formatDuration(startTime: Date, endTime: Date): string {
  const durationMs = endTime.getTime() - startTime.getTime();
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatDisplayDate(dateString: string): string {
  // Format: 20250702 -> "2 lipca 2025"
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);

  const months = [
    '', 'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
  ];

  return `${parseInt(day)} ${months[parseInt(month)]} ${year}`;
}

export function extractDateFromGameId(gameId: string): string {
  // Format ID: 20250702_2156 -> zwraca: 20250702
  return gameId.split('_')[0];
}

// ---------------------------------------------------------------------------
// Role / modifier name helpers
// ---------------------------------------------------------------------------

// Convert database role names to display names.
// Season-independent on purpose: this only un-squashes names the old mod wrote without spaces,
// and both registries spell them the same way.
export function convertRoleNameForDisplay(roleName: string): string {
  const roleNameMapping: Record<string, string> = {
    'SoulCollector': 'Soul Collector',
    'Soul Collector': 'Soul Collector',
    'GuardianAngel': 'Guardian Angel',
    'Guardian Angel': 'Guardian Angel',
  };
  return roleNameMapping[roleName] || roleName;
}

export function normalizeRoleName(roleName: string, season: number): string {
  const role = findRole(roleName, season);
  if (role) {
    return role.name;
  }
  // Fallback - capitalize first letter.
  // Note this mangles multi-word class names (`CrewmateGhost` -> `Crewmateghost`); #308 owns
  // deciding what an unresolvable role should do instead.
  return roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();
}

// Returns the icon path for a role given its DB name (e.g. "GuardianAngel" → "/images/roles/guardian_angel.png").
// Uses the role registry so multi-word roles with spaces are handled correctly.
export function getRoleIconPath(roleName: string, season: number): string {
  const role = findRole(roleName, season);
  if (role) {
    // Taken from the registry, not derived: legacy icons are snake_case under /images/roles/,
    // Mira's are PascalCase under /images/mira/roles/.
    return role.icon;
  }
  // Fallback: naive camelCase → snake_case conversion
  return `/images/roles/${roleName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()}.png`;
}

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

export function getTeamColor(team: string): string {
  switch (team) {
    case 'Crewmate': return 'rgb(0, 255, 255)';
    case 'Impostor': return 'rgb(255, 0, 0)';
    case 'Neutral': return 'rgb(167, 167, 167)';
    default: return 'rgb(255, 255, 255)';
  }
}

export function getRoleColor(roleName: string, season: number): string {
  if (roleName.toLowerCase() === 'crewmate') {
    return "#00FFFF";
  }
  if (roleName.toLowerCase() === 'impostor') {
    return "#FF0000";
  }
  if (roleName.toLowerCase() === 'plaguebearer') {
    return "#E6FFB3";
  }
  if (roleName.toLowerCase() === 'pestilence') {
    return "#E6FFB3";
  }

  const role = findRole(roleName, season);
  if (role) {
    return role.color;
  }

  const impostorRoles = ['shapeshifter', 'morphling', 'swooper', 'glitch', 'venerer'];
  const neutralRoles = ['jester', 'executioner', 'arsonist', 'plaguebearer', 'doomsayer', 'amnesiac'];

  if (impostorRoles.includes(roleName.toLowerCase())) {
    return "#FF0000";
  } else if (neutralRoles.includes(roleName.toLowerCase())) {
    return "#A7A7A7";
  } else {
    return "#00FFFF";
  }
}

export function getModifierColor(modifierName: string): string {
  const modifier = Modifiers.find(m =>
    m.name.toLowerCase() === modifierName.toLowerCase() ||
    m.id.toLowerCase() === modifierName.toLowerCase()
  );
  if (modifier) {
    return modifier.color;
  }
  return "#FFFFFF";
}

// ---------------------------------------------------------------------------
// URL slug helpers
// ---------------------------------------------------------------------------

// Generate a player avatar image path from their nickname
export function getPlayerAvatarPath(playerName: string): string {
  return `/images/avatars/${playerName}.png`;
}

// Convert a role name (possibly PascalCase from DB) to a URL-friendly slug (e.g. "SoulCollector" → "soul-collector")
export function convertRoleToUrlSlug(role: string): string {
  return convertRoleNameForDisplay(role).toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '');
}

// Convert a URL slug back to a display role name by matching against known roles
export function convertUrlSlugToRole(slug: string, allRoles: string[]): string {
  const slugLower = slug.toLowerCase();

  for (const role of allRoles) {
    const normalizedRole = convertRoleNameForDisplay(role);
    if (convertRoleToUrlSlug(normalizedRole) === slugLower) {
      return normalizedRole;
    }
  }

  // Fallback - konwertuj myślniki na spacje i kapitalizuj pierwsze litery słów
  const words = decodeURIComponent(slug.replace(/-/g, ' ')).split(' ');
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Convert a player nickname to a URL-friendly slug (e.g. "Some Player" → "some-player")
export function convertNickToUrlSlug(nick: string): string {
  return nick.replace(/\s+/g, '-').toLowerCase();
}

// ---------------------------------------------------------------------------
// Team determination
// ---------------------------------------------------------------------------

export function determineTeam(roleName: string | string[], season: number): string {
  // Handle array input - use last role (final role) like old system
  if (Array.isArray(roleName) && roleName.length === 0) {
    return Teams.Crewmate;
  }
  const roleToCheck = Array.isArray(roleName) ? roleName[roleName.length - 1] : roleName;

  if (roleToCheck.toLowerCase() === 'plaguebearer' || roleToCheck.toLowerCase() === 'pestilence') {
    return Teams.Neutral;
  }

  const role = findRole(roleToCheck, season);
  if (role) {
    return role.team;
  }

  // The silent Crewmate default below is a known defect — #308 owns replacing it. Kept here so
  // this change stays behaviour-preserving for seasons 2 and 3.

  const impostorRoles = ['impostor', 'shapeshifter', 'morphling', 'swooper', 'glitch', 'venerer'];
  const neutralRoles = ['jester', 'executioner', 'arsonist', 'plaguebearer', 'doomsayer', 'amnesiac'];

  if (impostorRoles.includes(roleToCheck.toLowerCase())) {
    return Teams.Impostor;
  } else if (neutralRoles.includes(roleToCheck.toLowerCase())) {
    return Teams.Neutral;
  } else {
    return Teams.Crewmate;
  }
}
