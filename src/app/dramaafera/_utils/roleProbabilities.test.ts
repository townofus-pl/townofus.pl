import { calculateRoleWeight } from './roleProbabilities';

test('overperforming crew reduces strong roles and promotes weaker roles', () => {
  expect(calculateRoleWeight(0.7, 0.5, 0.9)).toBeCloseTo(0.42);
  expect(calculateRoleWeight(0.7, 0.5, 0.4)).toBeCloseTo(0.62);
  expect(calculateRoleWeight(0.7, 0.5, 0.7)).toBe(0.5);
});

test('underperforming faction reverses the direction; meeting target restores base', () => {
  expect(calculateRoleWeight(0.1, 0.3, 0.8)).toBeCloseTo(0.78);
  expect(calculateRoleWeight(0.1, 0.3, 0)).toBeCloseTo(0.46);
  expect(calculateRoleWeight(0.3, 0.3, 1)).toBe(0.5);
});

test('strong corrections stay within the allowed weight range', () => {
  expect(calculateRoleWeight(0.5, 0, 1)).toBe(0);
  expect(calculateRoleWeight(0.5, 0, 0)).toBe(1);
});
