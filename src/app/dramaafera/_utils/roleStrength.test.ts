import { calculateRoleStrength, getRoleAssessment } from './roleStrength';

test('distinguishes missing evidence from a balanced role', () => {
    expect(calculateRoleStrength(0, 0)).toBeNull();
    expect(calculateRoleStrength(0, 5)).toBe(100);
});

test('k=3 shrinks small samples and treats buffs and nerfs symmetrically', () => {
    expect(calculateRoleStrength(5, 5)).toBeCloseTo(112.5);
    expect(calculateRoleStrength(-5, 5)).toBeCloseTo(87.5);
    expect(calculateRoleStrength(40, 40)).toBeCloseTo(100 + 20 * 40 / 43);
});

test.each([
    [null, 0, 'zbyt mała próba', 'text-gray-400'],
    [140, 2, 'zbyt mała próba', 'text-gray-400'],
    [60, 2, 'zbyt mała próba', 'text-gray-400'],
    [null, 3, 'zbyt mała próba', 'text-gray-400'],
    [79.99, 3, 'do buffa', 'text-red-400'],
    [80, 3, 'słabsza', 'text-yellow-400'],
    [89.99, 3, 'słabsza', 'text-yellow-400'],
    [90, 3, 'zbalansowana', 'text-green-400'],
    [100, 3, 'zbalansowana', 'text-green-400'],
    [110, 3, 'zbalansowana', 'text-green-400'],
    [110.01, 3, 'mocna', 'text-yellow-400'],
    [120, 3, 'mocna', 'text-yellow-400'],
    [120.01, 3, 'do nerfa', 'text-red-400'],
])('assessment for strength %s with %s appearances', (strength, appearances, label, className) => {
    expect(getRoleAssessment(strength, appearances)).toEqual({ label, className });
});
