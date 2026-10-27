import { getRoleAliases } from './roleAliases';

test('includes IdPart and display names for roles with spaces', () => {
    expect(getRoleAliases('Time Lord', 4)).toEqual(expect.arrayContaining(['TimeLord', 'Time Lord']));
});
test('expands bundled legacy roles without merging separate Mira roles', () => {
    expect(getRoleAliases('Plaguebearer', 3)).toContain('Pestilence');
    expect(getRoleAliases('Plaguebearer', 4)).not.toContain('Pestilence');
});
