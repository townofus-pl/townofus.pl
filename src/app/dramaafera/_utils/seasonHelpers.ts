import { CURRENT_SEASON } from '../_constants/seasons';

// Extracts the sub-path from a dramaafera pathname, stripping /dramaafera and /sezon/{id} prefixes.
// Examples:
//   "/dramaafera/sezon/1/ranking" → "/ranking"
//   "/dramaafera/ranking"         → "/ranking"
export function extractDramaAferaSubPath(pathname: string): string {
  let subPath = pathname.replace(/^\/dramaafera/, '');
  subPath = subPath.replace(/^\/sezon\/\d+/, '');
  return subPath || '/';
}

// Builds a full dramaafera URL with a season prefix when needed.
// `path` may be with or without a leading `/`; empty/whitespace/root values return the base URL.
// Current season: /dramaafera{path}
// Other seasons:  /dramaafera/sezon/{id}{path}
export function buildSeasonUrl(path: string, seasonId: number): string {
  let normalizedPath = path?.trim() ?? '';

  if (!normalizedPath || normalizedPath === '/') {
    normalizedPath = '';
  } else if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }

  if (seasonId === CURRENT_SEASON) {
    return `/dramaafera${normalizedPath}`;
  }
  return `/dramaafera/sezon/${seasonId}${normalizedPath}`;
}

/**
 * Sub-paths that have a `sezon/[seasonId]/` variant. Mirrors the directories under
 * `src/app/dramaafera/sezon/[seasonId]/` — keep the two in step.
 *
 * Without this the season switcher built `/dramaafera/sezon/N/<anything>` from whatever page you
 * happened to be on, so switching season from `/changelog`, `/informacje`, `/playlista`,
 * `/do_pobrania`, `/host` or `/lista-cweli` hard-404'd. See #313.
 */
export const SEASON_SCOPED_SUBPATHS = ['/historia-gier', '/ranking', '/role', '/user', '/wyniki'] as const;

export function isSeasonScopedSubPath(subPath: string): boolean {
  return SEASON_SCOPED_SUBPATHS.some((root) => subPath === root || subPath.startsWith(`${root}/`));
}
