import { buildGameTimeline, formatActionTimestamp, type TimelineAction } from './_buildGameTimeline';
import { findAbilityByKey, getActionAbility } from './_actionAbility';

jest.mock('@/mira/roles', () => ({ MiraRoles: [
  { name: 'Morphling', abilities: [{ name: 'Morph (Morfuj)', icon: '/morph.png' }] },
  { name: 'Glitch', abilities: [{ name: 'Mimic (Naśladuj)', icon: '/mimic.png' }] },
  { name: 'Miner', abilities: [{ name: 'Mine (Kop)', icon: '/mine.png' }] },
  { name: 'Time Lord', abilities: [{ name: 'Rewind (Cofnij)', icon: '/rewind.png' }] },
] }));
jest.mock('@/roles', () => ({ Roles: [] }));
jest.mock('@/app/dramaafera/_utils/gameUtils', () => ({
  convertRoleNameForDisplay: (name: string) => name,
  getRoleColor: () => '#ffffff',
}));

const action = (type: string, timestampMs = 0, name = 'Gracz'): TimelineAction => ({
  type, timestampMs, performerRole: 'Morphling', targetRole: null,
  isCorrect: null, detail: null, performer: { name }, target: null,
});

test('formats milliseconds as minutes and seconds', () => {
  expect(formatActionTimestamp(61999)).toBe('01:01');
});

test('hides only the first role assignment per player, even after a delayed start', () => {
  const result = buildGameTimeline([
    action('role_assigned', 5000), action('role_assigned', 6000, 'Drugi'),
    action('role_assigned', 10000), action('role_assigned', 11000, 'Drugi'),
  ], 4);
  expect(result.events.map(event => event.timestamp)).toEqual(['00:10', '00:11']);
});

test('groups round survivors within the same second and preserves other actions', () => {
  const result = buildGameTimeline([
    action('round_survived', 12001), action('kill', 12500),
    action('round_survived', 12999, 'Drugi'), action('round_survived', 13000),
  ], 4);
  expect(result.events).toHaveLength(3);
  expect(result.events[0].survivors?.map(player => player.name)).toEqual(['Gracz', 'Drugi']);
  expect(result.events[1].actionType).toBe('kill');
});

test('filters hidden actions and retains the win timestamp', () => {
  const result = buildGameTimeline(['modifier_gained', 'modifier_lost', 'win'].map(type => action(type, 42100)), 4);
  expect(result.events).toEqual([]);
  expect(result.endTimestamp).toBe('00:42');
  expect(result.hasTimeline).toBe(true);
  expect(buildGameTimeline([], 3).hasTimeline).toBe(false);
});

test('keeps reverse abilities distinct while retaining the original icon', () => {
  expect(findAbilityByKey('MorphlingUnmorph', 4)).toEqual({ name: 'Unmorph', icon: '/morph.png' });
  expect(findAbilityByKey('GlitchUnmimic', 4)).toEqual({ name: 'Unmimic', icon: '/mimic.png' });
  expect(findAbilityByKey('MinerRevealVent', 4)?.name).toBe('Mine');
  expect(findAbilityByKey('TimeLordRewind', 4)?.name).toBe('Rewind');
  expect(getActionAbility('{invalid', 4)).toBeUndefined();
  expect(findAbilityByKey('UnknownAbility', 4)).toBeUndefined();
});
