import { Teams } from '@/constants/teams';
import type { RoleProbabilityData } from './roleProbabilities';
import { updateRoleProbabilityConfig } from './roleProbabilityConfig';

const roles: RoleProbabilityData['roles'] = [
    { name: 'Time Lord', team: Teams.Crewmate, color: '#fff', games: 10, wins: 9, winRate: 0.9, weight: 0.344 },
    { name: 'Engineer', team: Teams.Crewmate, color: '#fff', games: 10, wins: 4, winRate: 0.4, weight: 0.746 },
    { name: 'Jester', team: Teams.Neutral, color: '#fff', games: 10, wins: 2, winRate: 0.2, weight: 0.62 },
];

test('updates only role Chance integers, retaining BOM, comments, spacing, CRLF and unrelated settings', () => {
    const content = '\uFEFF[Roles]\r\n# Default value: 0\r\nNum TownOfUs.Roles.Crewmate.TimeLordRole = 1\r\n  Chance TownOfUs.Roles.Crewmate.TimeLordRole  =  50  # keep\r\nNum TownOfUs.Roles.Crewmate.EngineerTouRole = 1\r\nChance TownOfUs.Roles.Crewmate.EngineerTouRole = 50\r\n[Other]\r\nChance TownOfUs.Roles.Crewmate.TimeLordRole = 90\r\nCooldown = 20\r\n';
    const result = updateRoleProbabilityConfig(content, roles);
    expect(result.content).toBe(content
        .replace('  =  50  # keep', '  =  34  # keep')
        .replace('Chance TownOfUs.Roles.Crewmate.EngineerTouRole = 50', 'Chance TownOfUs.Roles.Crewmate.EngineerTouRole = 75'));
    expect(result.updated).toBe(2);
});

test('does not enable Num=0 roles, change other modes or invent unknown weights', () => {
    const content = '[Roles]\nNum TownOfUs.Roles.Neutral.JesterRole = 0\nChance TownOfUs.Roles.Neutral.JesterRole = 0\nChance TownOfUs.Roles.Crewmate.FutureRole = 60\nChance TownOfUs.Roles.KillFrenzy.FrenzyBomberRole = 0\n';
    expect(updateRoleProbabilityConfig(content, roles)).toEqual({
        content, updated: 0, disabled: 1, unmatched: ['Future'],
    });
});

test('rejects invalid files and ambiguous or incomplete role settings', () => {
    expect(() => updateRoleProbabilityConfig('not a config', roles)).toThrow('brakuje sekcji');
    expect(() => updateRoleProbabilityConfig('[Roles]\n\0', roles)).toThrow('UTF-8');
    expect(() => updateRoleProbabilityConfig('[Roles]\nChance TownOfUs.Roles.Neutral.JesterRole = 50', roles)).toThrow('Num');
    expect(() => updateRoleProbabilityConfig('[Roles]\nChance TownOfUs.Roles.Neutral.JesterRole = 5.5', roles)).toThrow('Nieprawidłowy wpis');
    expect(() => updateRoleProbabilityConfig('[Roles]\nNum TownOfUs.Roles.Neutral.JesterRole = 1\nNum TownOfUs.Roles.Neutral.JesterRole = 2', roles)).toThrow('powielone');
    expect(() => updateRoleProbabilityConfig('[Roles]\nChance TownOfUs.Roles.Crewmate.FutureRole = 60', roles)).toThrow('Nie znaleziono');
});

test('replaces previously zero weights for enabled roles and preserves LF without a final newline', () => {
    const content = '[Roles]\nNum TownOfUs.Roles.Neutral.JesterRole = 1\nChance TownOfUs.Roles.Neutral.JesterRole = 0';
    expect(updateRoleProbabilityConfig(content, roles).content).toBe(content.replace('Role = 0', 'Role = 62'));
});
