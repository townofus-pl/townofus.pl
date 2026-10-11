import { MiraRoles } from '@/mira/roles';
import { Roles } from '@/roles';
import { FIRST_MIRA_SEASON } from '@/app/dramaafera/_constants/seasons';
import type { Ability } from '@/constants/abilities';
import { CommonAbilities } from '@/constants/abilities';
import { MiraCommonAbilities } from '@/mira/abilities';

export function getKillAbility(roleName: string, season: number, detail: string | null): Ability {
  const roles = season >= FIRST_MIRA_SEASON ? MiraRoles : Roles;
  const role = roles.find(candidate => normalize(candidate.name) === normalize(roleName));
  let isGuess = false;
  if (detail) {
    try {
      const parsed: unknown = JSON.parse(detail);
      isGuess = !!parsed && typeof parsed === 'object' && 'isGuess' in parsed && parsed.isGuess === true;
    } catch { /* Historical details may be absent or malformed. */ }
  }
  const names = isGuess ? ['Guess'] : ['Kill', 'Shoot', 'Execute', 'Ignite', 'Bite', 'Petrify', 'Poison', 'Prosecute', 'Guess'];
  for (const name of names) {
    const ability = role?.abilities.find(candidate => candidate.name.split('(')[0].trim() === name);
    if (ability) return { ...ability, name };
  }
  return season >= FIRST_MIRA_SEASON ? MiraCommonAbilities.Kill : CommonAbilities.Kill;
}

export function getVentAbility(roleName: string, season: number): Ability {
  const roles = season >= FIRST_MIRA_SEASON ? MiraRoles : Roles;
  const role = roles.find(candidate => normalize(candidate.name) === normalize(roleName));
  const ability = role?.abilities.find(candidate => candidate.name.split('(')[0].trim() === 'Vent');
  const fallback = season >= FIRST_MIRA_SEASON ? MiraCommonAbilities.Vent : CommonAbilities.Vent;
  return { ...(ability ?? fallback), name: 'Vent' };
}

const aliases: Record<string, string> = {
  PlumberBlock: 'PlumberBarricade',
  MinerPlaceVent: 'MinerMine',
  MinerRevealVent: 'MinerMine',
  HypnotistHypno: 'HypnotistHypnotise',
  VenererCamoAbility: 'VenererCamouflage',
  VenererSprintAbility: 'VenererSprint',
  VenererFreezeAbility: 'VenererFreeze',
  GlitchInitialHack: 'GlitchHack',
  GlitchUnmimic: 'GlitchMimic',
  MorphlingUnmorph: 'MorphlingMorph',
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Resolve the mod's ability key against the same definitions used by the role wiki. */
export function getActionAbility(detail: string | null, season: number): Ability | undefined {
  if (!detail) return undefined;
  try {
    const parsed: unknown = JSON.parse(detail);
    if (!parsed || typeof parsed !== 'object' || !('ability' in parsed) || typeof parsed.ability !== 'string') {
      return undefined;
    }
    const key = normalize(aliases[parsed.ability] ?? parsed.ability);
    const roles = season >= FIRST_MIRA_SEASON ? MiraRoles : Roles;
    for (const role of roles) {
      for (const ability of role.abilities) {
        const name = ability.name.split('(')[0].trim();
        if (normalize(role.name + name) === key) return { ...ability, name };
      }
    }
    // Unknown keys still remain visible as text in the timeline.
    return undefined;
  } catch {
    return undefined;
  }
}
