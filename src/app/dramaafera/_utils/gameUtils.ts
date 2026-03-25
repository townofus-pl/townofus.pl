// Pure utility functions for the Dramaafera game data layer.
// No Prisma/Cloudflare dependencies — safe to import from any module.

import { Roles } from '@/roles';
import { Modifiers } from '@/modifiers';
import { Teams } from '@/constants/teams';

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

// Convert database role names to display names
export function convertRoleNameForDisplay(roleName: string): string {
  const roleNameMapping: Record<string, string> = {
    'SoulCollector': 'Soul Collector',
    'Soul Collector': 'Soul Collector',
    'GuardianAngel': 'Guardian Angel',
    'Guardian Angel': 'Guardian Angel',
  };
  return roleNameMapping[roleName] || roleName;
}

export function normalizeRoleName(roleName: string): string {
  const role = Roles.find(r =>
    r.id.toLowerCase() === roleName.toLowerCase() ||
    r.name.toLowerCase() === roleName.toLowerCase()
  );
  if (role) {
    return role.name;
  }
  // Fallback - capitalize first letter
  return roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();
}

// Returns the icon path for a role given its DB name (e.g. "GuardianAngel" → "/images/roles/guardian_angel.png").
// Uses the role registry so multi-word roles with spaces are handled correctly.
export function getRoleIconPath(roleName: string): string {
  const displayName = convertRoleNameForDisplay(roleName);
  const role = Roles.find(r =>
    r.id.toLowerCase() === roleName.toLowerCase() ||
    r.name.toLowerCase() === displayName.toLowerCase() ||
    r.name.toLowerCase() === roleName.toLowerCase()
  );
  if (role) {
    return `/images/roles/${role.id}.png`;
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

export function getRoleColor(roleName: string): string {
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

  const displayRoleName = convertRoleNameForDisplay(roleName);

  const role = Roles.find(r =>
    r.name.toLowerCase() === displayRoleName.toLowerCase() ||
    r.id.toLowerCase() === roleName.toLowerCase() ||
    r.name.toLowerCase() === roleName.toLowerCase()
  );
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
// Team determination
// ---------------------------------------------------------------------------

export function determineTeam(roleName: string | string[]): string {
  // Handle array input - use last role (final role) like old system
  if (Array.isArray(roleName) && roleName.length === 0) {
    return Teams.Crewmate;
  }
  const roleToCheck = Array.isArray(roleName) ? roleName[roleName.length - 1] : roleName;

  if (roleToCheck.toLowerCase() === 'plaguebearer' || roleToCheck.toLowerCase() === 'pestilence') {
    return Teams.Neutral;
  }

  const displayRoleName = convertRoleNameForDisplay(roleToCheck);

  const role = Roles.find(r =>
    r.name.toLowerCase() === displayRoleName.toLowerCase() ||
    r.id.toLowerCase() === roleToCheck.toLowerCase() ||
    r.name.toLowerCase() === roleToCheck.toLowerCase()
  );
  if (role) {
    return role.team;
  }

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
